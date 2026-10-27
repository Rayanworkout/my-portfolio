---
title: "Setup A Nfs Server To Share Files On Local Network"
tags: [networking, disks, nfs]
---


To share file using Network File Sharing, we need to configure both the server and the client.

This way, you can mount one or many folder from a machine to another as long as they are both on the same network.

## Server Setup

The server is the machine that has the files you want to access from the other machine (the client)

```
sudo apt update
sudo apt install nfs-kernel-server
```


We need to specify which folder(s) we wish to make available.

```
sudo nano /etc/exports
```

Add this line with the right path, the local IP address of your client and the rights that you need (**r** for read, **w** for write)

```
/path/to/your/media 192.168.x.x(rw,sync,no_subtree_check)
```

```
sudo exportfs -a
```


## On client

The client is the machine that will be accessing the file present on the server.

```
sudo apt install nfs-common
```

Create a mount point for the shared folder.

```
mkdir laptop_media
```

Mount the folder. You need to specify the IP of the server, the path of the shared folder and where you want to mount it on your machine.

```
sudo mount 192.168.x.x:/path/to/your/media /mnt/laptop_media
```

And add it to `/etc/fstab` to [automatically mount it on boot](/blog/2026/01/16/automatically-mount-a-partition-on-boot/)

```
192.168.x.x:/path/to/your/media /mnt/laptop_media nfs defaults,soft 0 0
```

- The `soft` option ensures that operations (like accessing files) will timeout if the server is unavailable instead of hanging indefinitely.
- Note: Using `soft` may lead to data corruption if the connection drops during a write operation.