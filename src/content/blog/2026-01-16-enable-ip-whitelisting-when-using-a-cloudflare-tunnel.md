---
title: "Enable Nginx Proxy Manager IP whitelisting when using a Cloudflare Tunnel"
tags: [networking, security, nginx, nginx_proxy_manager, cloudflare, tunnel, reverse_proxy]
---

**TL;DR**
```nginx
# 1) Create an IP Whitelist access list and assign it to your host.
# - NPM evaluates the whitelisted IPs against the $remote_addr variable
# - We need to set the IP of the client connected to cloudflare as the $remote_addr.

# 2) Access your host custom configuration and enter this:

# Trust only the Docker bridge gateway (the direct peer connecting to NPM)
set_real_ip_from 172.20.0.1;
# We advertise cf_connecting_ip as the $remote_addr
real_ip_header CF-Connecting-IP;

# It _should_ work.
```

## IP Whitelisting without a tunnel

The method is straightforward in NPM:

- Create an access list
- Give it a name (for example `IP WHITELIST`)
- Tick "Satisfy Any" to allow either through the IP address or authentication
- Authentication can be set in the `Authorizations` tab
- In the `Rules` tab, enter the IP address(es) you wish to whitelist, and make sure `Deny` is set on `all`

However, if you access NPM through a cloudflare tunnel, this setup won't work. Even if you put your IP address, you will get a `403: Forbidden` response.

## Tunneling and `$remote_addr`

When using a **Cloudflare Tunnel**, the incoming connection is **not coming directly from the visitor’s IP**, but from **Cloudflare**, which proxies the request. As a result, Nginx Proxy Manager (NPM) does **not** see the visitor’s IP, but the **Docker bridge gateway IP** (for example `172.20.0.1`), not a Cloudflare edge IP.

When using a tunnel, the direct peer depends on how Nginx is deployed.  
If NPM runs in Docker and [cloudflared](https://github.com/cloudflare/cloudflared) runs on the host, the direct peer seen by Nginx is usually the **Docker bridge gateway** (`172.20.0.1`), not the cloudflared process itself.

To apply IP whitelisting, Nginx evaluates access rules (`allow` / `deny`) against the **`$remote_addr`** variable. However, when traffic comes through a Cloudflare Tunnel, `$remote_addr` initially contains the tunnel’s IP, not the real client IP, so whitelisting does not work as expected.

Fortunately, Cloudflare forwards the original visitor IP in the HTTP header **`CF-Connecting-IP`**.

For NPM to compare our whitelist against the correct IP address, we need Nginx to **replace `$remote_addr` with the value of `CF-Connecting-IP`**. 

The directive to do this is:
```nginx
# We tell Nginx to treat the value of this header as the real client IP
real_ip_header CF-Connecting-IP;
```

For security reasons, Nginx will only trust the `CF-Connecting-IP` header if the request comes from a **trusted source**. Trusted sources are defined using the **`set_real_ip_from`** directive.

Since our Nginx instance is receiving traffic from the **Docker bridge gateway**, we must trust the IP address of that gateway (for example `172.20.0.1`), which represents the immediate peer connecting to Nginx.

Doing this ensures 2 things::
- Only the tunnel is allowed to provide the real client IP
- External clients cannot spoof the `CF-Connecting-IP` header

The directive looks like this:

```nginx
set_real_ip_from 172.20.0.1;
```

## Hands on

### 1 - Creating the access list

Follow the steps at the beginning of this article to create an IP whitelisting access list and assign it to the host. (`3 dots --> edit --> Access List --> IP WHITELIST`)

### 2 - Setting the header

Still in the host edit panel, click on the `settings` logo at the top. This tab allows us to add custom Nginx configuration.

Enter the following directive:

```nginx
# We authorize only Docker subnet to provide real client IP
set_real_ip_from 172.20.0.0/16;
# Advertise cf_connecting_ip as the remote_addr
real_ip_header CF-Connecting-IP;
```

The `real_ip_header` directive tells Nginx where to look for the real client IP if a proxy is involved.

At this point, if the IP addresses in your access list are correct, access should work.

If it doesn't, let's debug it.

## Troubleshooting

If you made the previous steps but still get a `403: Forbidden`, we need to see what is happening on NPM side. 

### 1) Disable the access list temporarily

First, **disable the IP WHITELIST** access list on your host to avoid blocking yourself during debugging.

### 2) Add a diagnostic endpoint

Add the following configuration to your host:

```nginx

# Comment these if needed
set_real_ip_from 172.20.0.0/16;
real_ip_header CF-Connecting-IP;

location = /__whoami {
  default_type text/plain;
  return 200
"remote_addr=$remote_addr
realip_remote_addr=$realip_remote_addr
x_real_ip=$http_x_real_ip
cf_connecting_ip=$http_cf_connecting_ip
x_forwarded_for=$http_x_forwarded_for
";
}
```

Then access your host URL and append `/__whoami` to the path.

You will see an output similar to this, maybe with IPv4 in your case.

```bash
remote_addr=2a02:842b:f8fb:e141:474a:1e72:da05:7265
realip_remote_addr=172.20.0.1
x_real_ip=
cf_connecting_ip=2345:0425:2CA1:0000:0000:0567:5673:23b5
x_forwarded_for=2345:0425:2CA1:0000:0000:0567:5673:23b5
```

### 3) How to read this output

- **`cf_connecting_ip`**  
    This must contain the real visitor IP. If it doesn’t, Cloudflare is not forwarding it correctly.
- **`remote_addr`**  
    This is the most important value.  
    It must match the visitor IP for whitelisting to work.

- **If `remote_addr` still shows `172.20.0.1`**  
    Then Nginx is not trusting the tunnel. Check that:
    
    - `set_real_ip_from` includes the tunnel IP or subnet
        
    - The directives are applied in the correct host/context
        

Once `remote_addr` shows the real client IP, you can safely re-enable the IP whitelist.

## A thin layer of security

Using `set_real_ip_from 172.20.0.0/16;` is safe **as long as your Nginx instance is not directly exposed to the internet** and only receives traffic from the Docker network.

This setup adds a thin but important security layer:

- Only containers on the Docker network can influence `$remote_addr`
- External clients cannot spoof `CF-Connecting-IP`
- IP whitelisting remains effective and predictable
### Final note

The Real IP module does not change headers—it changes **who Nginx believes the client is**.  
Once `$remote_addr` is correct, Nginx Proxy Manager’s access lists work exactly as intended.
