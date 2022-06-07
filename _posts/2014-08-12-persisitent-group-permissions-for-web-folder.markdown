---
layout: post
title: Persisitent Group Permissions for Web Folder
description: Persisitent Group Permissions for Web Folder
---

You've got a VPS or some other managed (re: non-shared/reseller) server where httpd runs under the user `apache`. Apache, however, isn't an active user, so you can't upload your files in that name, resulting in an eventual "403: Forbidden" error on the front end.

There are probably better, more secure alternatives, but you can add your user to the `apache` group and then use `setfacl` to allow users in that group access to the folder. From then on, you can FTP, `git push`, etc, to your heart's content!

```bash
# add your user to the www-data group
usermod -a -G apache admin
# set the write permissions for the group on the web folder and contents
setfacl -Rm group:apache:rwx /var/www/com-domain-www
# set the default write permissions for the group on the web folder moving forward
setfacl -d -Rm group:apache:rwx /var/www/com-domain-www
```


