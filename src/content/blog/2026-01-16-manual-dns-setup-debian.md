---
title: "Debian manual DNS setup"
tags: [dns, networking]
---

To manually modify DNS settings of a machine under Debian 12 or derivatives, 2 methods:


## Test your DNS resolution

```bash
ping -c 3 google.com
# or
getent hosts google.com
```

## Method 1 (using NetworkManager)

The file `resolv.conf` contains the DNS server(s) and is managed by Network Manager.

It means that after a reboot or **at any moment**, this file could be overwritten by Network Manager.
For this reason we should not manually edit this file, it would be an unstable solution.

**The correct way to edit the DNS on a Debian system is to edit the Network Manager profile. For that we use the CLI tool.**

```bash
# Find the active connection name (without removing the existing one)
nmcli -t -f NAME,DEVICE connection show --active

# exemple output: Wired connection 1:ens18

# We add another DNS entry through the CLI
sudo nmcli connection modify "<CONN>" +ipv4.dns "1.1.1.1 8.8.8.8"

# Exemple
sudo nmcli connection modify "Wired connection 1" +ipv4.dns 1.1.1.1

# Optionally
sudo nmcli connection modify "<CONN>" ipv4.ignore-auto-dns yes

# Then apply it
sudo nmcli connection down "<CONN>" && sudo nmcli connection up "<CONN>"
```


### Show the current DNS servers

```bash
nmcli dev show ens18 | grep IP4.DNS
```

## Method 2 (if applicable)

Modify these 2 files.

### /etc/systemd/resolved.conf

You need to enter a spaced separated list of DNS servers.
```
[Resolve]
DNS=1.1.1.1 1.0.0.1
```


### /etc/resolvconf/resolv.conf.d/head

In this file, enter each DNS server on a new line.

```
nameserver 1.1.1.1
nameserver 1.0.0.1
```

Then run these 2 commands:

- sudo resolvconf --enable-updates
- sudo resolvconf -u
