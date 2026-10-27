---
title: "Get The Most Memory Hungry Processes"
tags: [linux, debian, memory, system]
---

## Check free memory for the host

```bash
free -h
```

Example output.

```bash
free -h
               total        used        free      shared  buff/cache   available
Mem:           512Mi       362Mi        66Mi        24Ki        83Mi       149Mi
Swap:          512Mi        74Mi       437Mi

```
## Check the X first processes using the most memory
```bash
ps -eo pid,comm,rss,%mem --sort=-rss | head -n 15
```

Exemple output

```bash
PID COMMAND           RSS %MEM
     85 AdGuardHome     353412 67.4
     94 tailscaled      30768  5.8
   1884 pickup           6188  1.1
      1 systemd          4232  0.8
     44 systemd-journal  4216  0.8
   1902 ps               3708  0.7
    346 bash             3680  0.7
    195 systemd-network  2556  0.4
     92 systemd-logind   2416  0.4
    328 qmgr             2004  0.3
   1903 head             1960  0.3
     87 dbus-daemon      1684  0.3
    325 master           1648  0.3
     86 cron             1564  0.2
```
