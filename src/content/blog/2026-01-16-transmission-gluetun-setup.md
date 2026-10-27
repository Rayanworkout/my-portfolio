---
title: "Transmission + Gluetun Setup for safe and anonymous torrent downloading"
tags: [guide, vpn, torrenting, docker]
---

This compose file runs both transmission and gluetun containers, allowing to use my torrent client only through my VPN.

Using `network_mode: "container:gluetun"` forces the transmission container to
route all its network traffic through glutun container.

Gluetun itself is just a connection to Mullvad VPN through Wireguard protocol

The current ip address and country of the transmission container can be verified by running:

```
docker exec -it transmission curl -s https://ipinfo.io/countryfo.io
```

Or alternatively:

```
docker exec -it transmission curl ifconfig.me
```


When we stop the gluetun container, it stops every network traffic of transmission,
even the Web UI (port 9091).

*Reminder: the `WIREGUARD_PRIVATE_KEY` variable is found by generating a Wireguard config file on the Mullvad website, same for the `WIREGUARD_ADDRESSES` variable.*

[Full tutorial here.](https://github.com/qdm12/gluetun-wiki/blob/main/setup/providers/mullvad.md)


Command to list available countries
```
docker run --rm -v .:/gluetun qmcgaw/gluetun format-servers -mullvad
```

```yaml
services:
  transmission:
    image: lscr.io/linuxserver/transmission:latest
    container_name: transmission
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Europe/Paris
    volumes:
      - ./config:/config
      - /home/rayan/media:/downloads
      - ./watch:/watch
    restart: unless-stopped
    network_mode: "container:gluetun"
    depends_on:
      - gluetun

  gluetun:
    image: qmcgaw/gluetun
    container_name: gluetun
    cap_add:
      - NET_ADMIN
    devices:
      - /dev/net/tun:/dev/net/tun
    environment:
      - VPN_SERVICE_PROVIDER=mullvad
      - VPN_TYPE=wireguard
      - WIREGUARD_PRIVATE_KEY=PRIVATE_KEY
      - WIREGUARD_ADDRESSES=ADDRESS
      - SERVER_COUNTRIES=Sweden,Netherlands,Romania
    ports:
      - 9091:9091
      - 51413:51413
      - 51413:51413/udp
    restart: unless-stopped
```
