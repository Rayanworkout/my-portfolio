---
title: "Creating a Samba server"
tags: [samba, networking, storage]
---

## We will create a new Samba user with no login privileges and only access to its documents folder.

```
apt install -y samba
```

```
# The folder we will share
mkdir -p /srv/docs
```

### Create a group for Samba users (recommended):

```
groupadd -f sambashare
chgrp -R sambashare /srv/docs
chmod -R 2770 /srv/docs
```

Or if you want to share your home folder.

```bash
sudo adduser sambashare --home /home/sambashare --shell /usr/sbin/nologin
```

- The `2` (setgid) keeps new files in the same group.

```
# Set password
smbpasswd -a docuser
# Enable
smbpasswd -e docuser
```

### Edit conf
```
nano /etc/samba/smb.conf
```

```
[docs]
   path = /srv/docs
   browseable = yes
   read only = no
   valid users = docuser
   force group = sambashare
   create mask = 0660
   directory mask = 2770
```

The share is called docs, we will access it with \\SERVER IP\docs and the user docuser + its password with set with `smbpasswd`.

Optional firewall rules

```bash
sudo ufw allow from 192.168.1.0/24 to any port 445 proto tcp comment 'Samba LAN'
sudo ufw allow from 192.168.1.0/24 to any port 139 proto tcp comment 'Samba LAN'
```