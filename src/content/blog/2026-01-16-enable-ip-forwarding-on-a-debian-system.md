---
title: "Enable IP forwarding on a Debian system"
tags: [networking, commands]
---

```bash
sudo mkdir -p /etc/sysctl.d
```

```bash
sudo tee /etc/sysctl.d/99-forwarding.conf >/dev/null <<'EOF'
net.ipv4.ip_forward = 1
net.ipv6.conf.all.forwarding = 1
EOF
```

```bash
sudo sysctl --system # load conf
```

## OR

```bash
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w net.ipv6.conf.all.forwarding=1
```

```bash
# Check config
sysctl -p
```
## To persist after reboot for a specific interface / tool:

```bash
sudo tee /etc/sysctl.d/99-tailscale.conf >/dev/null <<EOF
net.ipv4.ip_forward=1
net.ipv6.conf.all.forwarding=1
EOF
```
