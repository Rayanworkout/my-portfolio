---
title: "Expose your LAN through Tailnet Subnet Router"
tags: [tailscale, networking]
---

Using a Tailscale device, you can access your whole LAN.

You first need to [enable IP forwarding](/blog/2026/01/16/enable-ip-forwarding-on-a-debian-system/).


Then launch Tailscale and advertise the device as a subnet router.


```bash
sudo tailscale set --advertise-routes=192.168.1.0/24
```

## Approve the route in Tailscale

1. Go to the **Tailscale Admin Console**
2. Open **Machines**
3. Select this LXC machine
4. Under `Edit route settings`, **approve** the advertised route.

At this point, any device connected to your tailnet can reach `192.168.1.0/24`.


## Troubleshooting LAN Access with Tailscale

I encountered an issue related to **LAN traffic prioritization / overlapping subnet routes** when using Tailscale with an LXC container acting as a subnet router.

When the Tailscale subnet-router LXC was **offline**, I was unable to access services on my local LAN. This happened because my laptop, while connected to Tailscale, **preferred the advertised Tailscale subnet route over the local LAN route**. As a result, traffic destined for local IP addresses was sent toward the (down) subnet router instead of directly to the LAN, effectively black-holing the connection.

Tailscale documents this behavior here:  
[https://tailscale.com/kb/1636/connect-lan-failure](https://tailscale.com/kb/1636/connect-lan-failure?utm_source=chatgpt.com)

### Workaround

As a temporary workaround, I disable subnet route acceptance on my laptop when I am on the local network:

```bash
sudo tailscale set --accept-routes=false
```

When I am outside my LAN and need access via the subnet router, I re-enable route acceptance:

```bash
sudo tailscale set --accept-routes=true
```

This approach prevents local LAN access from breaking when the subnet router is unavailable, while still allowing remote access when needed.