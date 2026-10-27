---
title: "Setup a local CouchDB instance over HTTPS"
tags: [tls, lan, caddy, reverse_proxy]
---


```bash
mkdir couchdb-data couchdb-etc
```


## Docker compose file with CouchDB + Caddy.
Caddy handles the certificates itself.


## Caddyfile
```nginx
couchdb.home {
  tls internal
  reverse_proxy 127.0.0.1:5984
}
```


```bash
services:
  couchdb:
    image: couchdb:latest
    container_name: couchdb
    user: 5984:5984
    environment:
      - COUCHDB_USER=rayan
      - COUCHDB_PASSWORD=PASSWORD
    volumes:
      - ./couchdb-data:/opt/couchdb/data
      - ./couchdb-etc:/opt/couchdb/etc/local.d
    ports:
      - 5984:5984
    restart: unless-stopped

  caddy:
    image: caddy:2
    container_name: couchdb-caddy
    network_mode: "host"
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

If you get permission issues when launching the container:
```bash
sudo chown -R 5984:5984 couchdb-etc couchdb-data
sudo chmod -R u+rwX,g+rwX couchdb-etc couchdb-data
```

Then copy the certificate from the docker container to your host.


```bash
docker cp couchdb-caddy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
```

And make it trusted on your client devices.

Windows: [Trusted Root Certification Authorities certificate store](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/trusted-root-certification-authorities-certificate-store)

iPhone: [How to install certificates on iPhone](https://www.softmoco.com/en/devenv/how-to-install-intermediate-and-root-ca-certificates-to-iphone.php)
