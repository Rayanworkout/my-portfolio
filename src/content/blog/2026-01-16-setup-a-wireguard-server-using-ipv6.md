---
title: "Setup a Wireguard Server using IPV6"
tags: [vpn, wireguard, networking]
---

[Wireguard official Website](https://www.wireguard.com/)

_Initial article for IPv4:_ [Installer WireGuard LXC](https://technonagib.fr/installer-wireguard-lxc/)


If you're doing the setup on Proxmox:

```bash
# Enable Wireguard module
modprobe wireguard

# At boot too
echo "wireguard" >> /etc/modules-load.d/modules.conf
```


## You need to [enable IP forwarding](/blog/2026/01/16/enable-ip-forwarding-on-a-debian-system/).

## Minimal wireguard install

```bash
apt install --no-install-recommends wireguard-tools
```


```bash
# Where Wireguard config files live
cd /etc/wireguard

# Apply umask 077 to files created in this dir
umask 077
```


Generating a private key and deriving public key from it:

```bash
wg genkey | tee privatekey | wg pubkey > publickey
```


We also create a key for a peer, here iPhone:

```bash
wg genkey | tee iphone_private_key | wg pubkey > iphone_public_key
```

Then we create the config for the interface.

```bash
nano /etc/wireguard/wg0.conf
```

```bash
[Interface]
PrivateKey = <server-privatekey>
Address = 10.0.0.1 # subnet
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
ListenPort = WANTED_PORT # Default 51820

[Peer]
# Iphone
PublicKey = <iphone-publickey>
AllowedIPs = 10.0.0.2/32 # IP address that will be given to the iPhone
PersistentKeepalive = 25 # Useful when being NAT or firewall, check docs.
```

We create the config for the peer, here iphone

```bash
nano /etc/wireguard/iphone.conf
```

```bash
[Interface]
PrivateKey = <iphone-privatekey>
Address = 10.0.0.2/24 # Same as in "AllowedIPs"
ListenPort = 51820 # Same port as in wg0.conf
DNS = 1.1.1.1 # Wanted DNS

[Peer]
# Iphone
PublicKey = <server-publickey>
Endpoint = <public-ip:51820
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
```

```plaintext
chown -R root:root /etc/wireguard
chmod -R og-rwx /etc/wireguard
systemctl --now enable wg-quick@wg0.service
```

If you get an error like this:

```
/usr/bin/wg-quick: line 295: iptables: command not found
```

Install it.

```
sudo apt install -y iptables
```

## Generate a QR Code from peer config

```bash
apt install qrencode
```

```plaintext
qrencode -t ansiutf8 < /etc/wireguard/iphone.conf
```


The last step is to create NAT rule on your router to redirect inbound traffic to your server on the specified port.


This setup is good for IPV4, but if you're under CGNAT, it won't work. The traffic won't reach your  server. A solution is to use IPV6 instead.

We create an IPV6 firewall rule to allow inbound trafic and redirect it to our wireguard server on its reachable IPV6.

In the peer config, `Endpoint` become `[PUBLIC_IPV6]:WANTED_PORT`. (the brackets must stay.)

For this to work, make sure [IP Forwarding](/blog/2026/01/16/enable-ip-forwarding-on-a-debian-system/) is enabled !

Quick troubleshoot if no handshake happens;

```bash
sysctl -w net.ipv6.conf.all.forwarding=1
sysctl -w net.ipv6.conf.default.forwarding=1
```


Make this setting persistent

```bash
nano /etc/sysctl.d/99-ipv6.conf


net.ipv6.conf.all.disable_ipv6=0
net.ipv6.conf.default.disable_ipv6=0
net.ipv6.conf.eth0.disable_ipv6=0
net.ipv6.conf.eth0.accept_ra=1
net.ipv6.conf.eth0.autoconf=1
```

Check

```bash
wg show
```
