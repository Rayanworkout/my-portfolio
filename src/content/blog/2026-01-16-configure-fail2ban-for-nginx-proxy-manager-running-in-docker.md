---
title: "Configure Fail2ban for Nginx Proxy Manager running in Docker"
tags: [reverse_proxy, networking, security, nginx_proxy_manager]
---

Since NPM runs inside a docker container, we cannot use a classic Fail2Ban jail. We need to manually create an action and a filter.

[Youtube tutorial](https://www.youtube.com/watch?v=MuhR-7ygsXA)

- Filenames must be identical

```
# /etc/fail2ban/action.d/npm.conf

[Definition]

actionstart = iptables -N f2b-npm-docker
              iptables -A f2b-npm-docker -j RETURN
              iptables -I FORWARD 1 -p tcp -m multiport --dports 0:65535 -j f2b-npm-docker

actionstop = iptables -D FORWARD -p tcp -m multiport --dports 0:65535 -j f2b-npm-docker
             iptables -F f2b-npm-docker
             iptables -X f2b-npm-docker

actioncheck = iptables -n -L FORWARD | grep -q 'f2b-npm-docker[ \t]'

actionban = iptables -I f2b-npm-docker -s <ip> -j DROP

actionunban = iptables -D f2b-npm-docker -s <ip> -j DROP
```


We can use multiple values for `failregex`  directive. The goal is to match the error log of the program we want to monitor. We can use [regex101](https://regex101.com/) to test our regexes. Sometimes, like for the memo application, failed login attempts are not logged, so we can not bind it to Fail2Ban.

Test regex against log file:
```
grep -P 'PATTERN' your_log_file.log
```


```
# /etc/fail2ban/filter.d/npm-docker.conf

[INCLUDES]

[Definition]

failregex = ^<HOST>.+" (4\d\d|3\d\d) \d\d\d .+$
	    ^.+ (4(?!04)\d\d|5\d\d) .*- .+ ".*(~|admin|dbadmin|install|myadmin|MyAdmin|mysql|websql|pma|wp-|manager|info|server|config).*" \[Client <HOST>\] \[Length .+\] .+$
	    ^.+ 4(?!0[45])\d\d \d\d\d - .+ \[Client <HOST>\] \[Length .+\] .+$
	    ^.+ 302 \d\d\d - .+ \[Client <HOST>\] \[Length .+\] .+$
	    ^.+ 303 \d\d\d - .+ \[Client <HOST>\] \[Length .+\] .+$

```


**We need to locate npm logs path**
```
# /etc/fail2ban/jail.d/npm.local

[npm-docker]
enabled = true
ignoreip = 127.0.0.1/8 192.168.0.0/16 172.16.0.1/12
action = npm
logpath = /home/rayan/tools/nginx_proxy_manager/data/logs/default-host_*.log
		      /home/rayan/tools/nginx_proxy_manager/data/logs/proxy-host-*.log
maxretry = 8
bantime  = 365d
findtime = 6h
filter = npm-docker
```
