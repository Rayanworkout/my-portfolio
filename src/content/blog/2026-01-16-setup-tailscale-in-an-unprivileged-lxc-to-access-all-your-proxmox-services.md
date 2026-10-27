---
title: "Setup Tailscale in an unprivileged Proxmox LXC to access all your Proxmox services"
tags: [tailscale, proxmox, networking, security]
---

[Tailscale tutorial](https://tailscale.com/kb/1130/lxc-unprivileged)

This guide sets up a **Tailscale subnet router inside an unprivileged LXC** so your tailnet can access your local LAN and by extension you can reach every service hosted on your proxmox host.

For securiity concerns, don't forget to setup and use Tailscale ACL to have a fine grainded control on which device can access your local network.

## Create the LXC container

- Create an **unprivileged LXC**
- Resources: **1 vCPU, 512 MB RAM** (sufficient)
- Network:
    - IPv4: **DHCP** (You can switch to a static IP later once confirmed working)

**Do not start the container yet**.

## Enable TUN support (host-side)

On the **Proxmox host**, edit the container config:

```bash
nano /etc/pve/lxc/<LXC_ID>.conf 
```

Add at the bottom:

```bash
lxc.cgroup2.devices.allow: c 10:200 rwm
lxc.mount.entry: /dev/net/tun dev/net/tun none bind,create=file
```

Save the file.

## Start the container and [enable IP forwarding](/blog/2026/01/16/enable-ip-forwarding-on-a-debian-system/)

Start the container and log in.

Enable IP forwarding for both IPv4 and IPv6 (needed for Tailscale subnet advertisement).

Update container and install + enable Tailscale

```bash
apt update && apt upgrade -y
apt install curl
curl -fsSL https://tailscale.com/install.sh | sh

tailscale up

# If you want this LXC to act as an exit node add this
# --advertise-exit-node
# or ssh
# --ssh
# or subnet router (dedicated guide)
```

Test that you're connected to your tailnet with `tailscale status`



## (Optional) Switch to a static IP

Once confirmed working:

- Change the LXC network from DHCP → static
- Restart the container
- No Tailscale changes needed