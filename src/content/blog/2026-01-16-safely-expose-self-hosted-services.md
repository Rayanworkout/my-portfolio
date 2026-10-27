---
title: "Safely expose selfhosted services"
tags: [networking, security, cloudflare, tls]
---

This guide explains how to securely expose your self-hosted services to the internet using **Cloudflare Tunnel** and **Nginx Proxy Manager**, ensuring a safe and reliable setup by design.

The request workflow will be the following:
`Client -->  Cloudflare —> Access Control Tunnel --> Proxy through Nginx --> Service authentication --> Service`

*Prerequisites*:
- One or more services to expose, running in Docker or directly on your machine
- [Nginx Proxy Manager](https://nginxproxymanager.com/guide/) running and listening on port 80
- A [Cloudflare](https://www.cloudflare.com/) account
- A domain name managed by Cloudflare (set Cloudflare nameservers for your domain)
- SSL/TLS in Cloudflare set to Full
- Your machine's firewall configured to allow traffic on the ports where your services are running

## 1 - Create the tunnel

1. Login to [Cloudflare ZeroTrust dashboard](https://one.dash.cloudflare.com/).

2. Navigate to Networks > Connector and create a new tunnel.

3. Follow the steps to install cloudflared (e.g., using Docker) and ensure the tunnel is properly connected.

4. Create a Public Hostname:
    - Enter the domain name (no subdomain for now).
    - Set the Type to http if your service is served locally over http.
    - Provide the local machine's private IP (e.g., 192.168.x.x) in the URL, leaving out the port (since we want to reach port 80).

Cloudflare will automatically create a related DNS CNAME record.

## 2 - Configure Nginx Proxy Manager

Now we need to tell Nginx how to map the incoming requests.

1. In Nginx Proxy Manager, create a new Proxy Host.

2. Enter the same domain name as in the public hostname.

3. If your service is locally running through http, select http, otherwise https. (*Note: Using http here is fine because the traffic will still be encrypted between Cloudflare and Nginx.*)

4. Set the IP Address to the private address of your machine and specify the port **where the service is running.**

5. Optionally, enable Cache Assets and Block Common Exploits.

6. Switch to the SSL tab:
    - Generate or select an SSL certificate for the domain.
    - Do NOT check Force SSL to avoid conflicts with Cloudflare's HTTPS enforcement.
    - Optionally enable HTTP/2 Support.

Save the configuration. Your service should now be accessible at https://your-domain.com.

## 3 - Add a subdomain for another service

Now that everything is setup, adding a subdomain is easy.

1. Add a new Public Hostname in the Cloudflare Tunnel settings:
    - Use a subdomain (e.g., memos.rayan.wiki).
    - Choose HTTP and not HTTPS
    - Set the same IP address as the root domain, still without the port. (*We target port 80 again, Nginx will then proxy the request to the correct port.*)
 
2. In Nginx Proxy Manager, create a new Proxy Host:
    - Enter the subdomain in the Domain Names field.
    - Specify the private IP as earlier and the port of the new service.
    - Configure SSL as done for the root domain.

Your second service should now be accessible at https://your-subdomain.your-domain.com.


The current setup should be quite secure. We did not open any port of our router, we rely on Cloudflare security through the tunnel, we map the request through Nginx and then we have the authentication of the service itself. Add to this the UFW protection as well as Docker's network isolation.


## 4 - Optional: Access Control with Cloudflare Zero Trust

We could add an extra layer of security by using Cloudflare ZeroTrust Policies. It means we can enforce rules that defines who can access or not our services and domains. For example, we could authorize only some IP Ranges, some emails (with code confirmation) or some countries.

1. Go to `Access > Applications` in the [Cloudflare ZeroTrust dashboard](https://one.dash.cloudflare.com/).

2. Create a new Self-Hosted Application and configure it.
    - In the Policies tab, define rules:
    - Use Allow to require email-based authentication for approved users.
    - Use Bypass to grant access without authentication for trusted users (e.g., based on IP ranges or countries).
    

## Conclusion and security layers overview

- No router ports are exposed; all traffic flows through the secure Cloudflare Tunnel.
- Nginx Proxy Manager handles local request mapping.
- Service authentication provides an additional layer of protection.
- Cloudflare's security features, combined with UFW and Docker’s network isolation, further enhance safety.
  
