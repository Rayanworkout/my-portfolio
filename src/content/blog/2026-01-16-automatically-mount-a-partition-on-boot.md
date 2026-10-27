---
title: "Automatically Mount a partition on boot"
tags: [disks, automation, guide, linux]
---


To ensure a partition is automatically mounted at boot, you need to configure the `fstab` file.

- `lsblk`: displays all disks and partitions
- `blkid`: displays UUID of each partitions

```
sudo nano /etc/fstab
```

It will look like something like this.

```
proc            /proc           proc    defaults          0       0
PARTUUID=d5647e4a-01  /boot/firmware  vfat    defaults          0       2
PARTUUID=d5647e4a-02  /               ext4    defaults,noatime  0       1
```

Now you just need to add an entry to automatically mount the wanted partition at the desired location.

```
PARTUUID=ace7e16b-02 /mnt/home_backup ext4    defaults 0 2
```

Explanation of Each Element:
- proc
A virtual filesystem required by Linux.
Do not modify or remove.

- PARTUUID/UUID
Identifiers for the partitions to be mounted.
Example:
`PARTUUID=9952c2f3-01` mounts the SD card partition at `/boot/firmware`.

- Filesystem Type
`vfat`: Used for SD card partitions.
`ext4`: Commonly used for SSD or HDD partitions.

- Options
`defaults`: Standard mount options.
`noatime`: Reduces disk writes, optimizing SSD usage.

`0`: Disables backups.
`1` or `2`: Configures filesystem checks during boot.
