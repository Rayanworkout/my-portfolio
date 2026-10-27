---
title: "Create an Anacron"
tags: [anacron, automation]
---
Anacron is a task scheduler similar to Cron, but it is designed for systems that don't run 24/7. It ensures scheduled tasks are executed even if the system was off when the task was supposed to run.

If needed:
```bash
sudo apt install anacron
```


To create one, edit this file:
```bash
sudo nano /etc/anacrontab
```

The format is the following:
```bash
period   delay   job-id   command
```

Some examples of entries:
```bash
# Every 3 days, execute this Python script after 15 minutes
3       15      ping-websites   /usr/bin/python3 /home/rayan/dev/utils/scripts/ping_websites.py

# Every 6 days, execute this one after 20 minutes
6       20      backup_silverbullet_notes   /home/rayan/dev/utils/scripts/backup_silverbullet_notes.sh
```

## Testing

First, delete the previous runs.

```
ls /var/spool/anacron/
sudo rm /var/spool/anacron/YOUR_RUNS
```

To run `anacron` manually: `sudo anacron -d`

Sometimes an anacron command may not run because it runs command as `root`, and `root` may not have access to specific resources (ie: ssh keys).

In this case we need to run the anacron as a specific user. The command will be the following:

```
runuser -u rayan -- /usr/bin/rsync -av --delete /home/rayan/obsidian_vault rpi:/home/rayan/backups
```





