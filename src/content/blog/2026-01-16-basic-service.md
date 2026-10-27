---
title: "Basic Systemd service file"
tags: []
---


#systemd #automation 

- `User` must have the permissions to access and run the script.

- Runtime arguments can be supplied along the script command `--some-arg=True`.

- env variables can be supplied using as many `Environment` directives as needed.

- A `systemd` unit file must not have comments


```bash
[Unit]
Description=webhook listener
After=network.target

[Service]
WorkingDirectory=/path/to/project/root
ExecStart=/path/to/.venv/bin/python /path/to/script.py --some-arg=True
Restart=on-failure
RestartSec=500ms
User=rayan
Group=sudo

Environment=JWT_SECRET="REPLACE_WITH_YOUR_SECRET"
Environment=AUTH_ORIGIN="https://rayan.wiki"
Environment=NEXTAUTH_URL="https://rayan.wiki"

[Install]
WantedBy=multi-user.target
```

