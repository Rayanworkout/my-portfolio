---
title: "Debug IP addresses reaching NPM"
tags: [networking, nginx_proxy_manager, nginx, cloudflare, reverse_proxy]
---

If for any reason (IP Whitelisting for example) you want to see what IP addresses are received on Nginx Proxy Manager end, just add this to one of your host in the `settings > Custom Nginx Configuration`

```bash
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

Now you can access the address of your host at the `__whoami` endpoint and you will see these informations, in this case IPv6 addresses.

```bash
remote_addr=2a02:842b:f8fb:e141:474a:1e72:da05:7265
realip_remote_addr=172.20.0.1
x_real_ip=
cf_connecting_ip=2345:0425:2CA1:0000:0000:0567:5673:23b5
x_forwarded_for=2345:0425:2CA1:0000:0000:0567:5673:23b5
```