---
title: "Clone Raspberry Pi OS with Rpi Clone"
tags: [raspberrypi, guide]
---


## Clone Raspberry Pi OS from SD Card to SSD using rpi-clone

- [Repository](https://github.com/geerlingguy/rpi-clone)

- [Tutorial](https://rpi-clone.jeffgeerling.com/)

1) Installation

```bash
curl https://raw.githubusercontent.com/geerlingguy/rpi-clone/master/install | sudo bash
```

If booting off an internal microSD card, clone to a PCIe NVMe SSD, use the following command:
```bash
# Micro SD ---> SSD
sudo rpi-clone nvme0n1
```

For some reason, the Raspberry will be able to boot and mount SSD as root, but you won't be able to SSH into it, even after changing boot order.

```
kex_exchange_identification: read: Connection reset by peer
Connection reset by 192.168.1.227 port 22
```

With SD Card inside everything works fine.