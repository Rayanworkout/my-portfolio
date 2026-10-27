---
title: "Expose a service to your tailnet via HTTPS with Tailscale"
tags: [networking, tailscale, tls, security ]
---

To expose a service via HTTPS only through your tailscale tailnet, run the following command:

```bash
sudo tailscale serve --bg http://127.0.0.1:SERVICE_PORT
```

We can also choose a specific path:

```bash
sudo tailscale serve --bg --set-path=/couchdb http://127.0.0.1:SERVICE_PORT
```


We can also choose on which port we wish to serve the app if port 443 is already in use.

```bash
sudo tailscale serve --bg --https WANTED_PORT http://127.0.0.1:SERVICE_PORT
```

It will generate a link on which you can access your service. To stop it, run:

```bash
sudo tailscale serve --https=WANTED_PORT off
```

To check currently served services, run:

```bash
sudo tailscale serve status
```

And to remove a single path:

```bash
sudo tailscale serve https /couchdb off
```

It also possible to use Tailscale funnel to make it available for anyone on internet, but it should be used with caution, and only for a short period of time.