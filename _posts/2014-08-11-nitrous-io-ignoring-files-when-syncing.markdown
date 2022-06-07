---
layout: post
title: "Nitrous.io: Ignoring Files When Syncing"
description: "Nitrous.io: Ignoring Files When Syncing"
---

I've been using [Nitrous.io](https://www.nitrous.io/join/ks1xdFYYhts?utm_source=nitrous.io&utm_medium=copypaste&utm_campaign=referral) as a remote development environment for a few months now. I love the syncing, the management via SSH, the scalability, etc. I do most of my work on there.

One of the first issues I had with [Nitrous.io](https://www.nitrous.io/join/ks1xdFYYhts?utm_source=nitrous.io&utm_medium=copypaste&utm_campaign=referral) was fine-tuning what is and is not synced using their [desktop application](https://www.nitrous.io/desktop). When I'm working on a WordPress site, I don't need `/wp-content/uploads/` synced in both directions. When I'm working on a [Symfony](http://symfony.com/) app, I don't need `/app/cache/` on my local machine. Syncing these, however, is the default and can cause a considerable delay when saving simple changesets, and can eat up network bandwidth when there may not be a lot available (re: wifi at the library, coffee shop, etc).

Thankfully, [Nitrous.io](https://www.nitrous.io/join/ks1xdFYYhts?utm_source=nitrous.io&utm_medium=copypaste&utm_campaign=referral) uses the [well documented](http://www.cis.upenn.edu/~bcpierce/unison/download/releases/stable/unison-manual.html), GNU licensed [Unison](http://www.cis.upenn.edu/~bcpierce/unison/) for synchronization.

According to the [Unison docs](http://www.cis.upenn.edu/~bcpierce/unison/download/releases/stable/unison-manual.html#ignore), you can select specific filenames, paths, or regexs to ignore (along wiht various other options) when determining what to sync. These options need to be put into your `default.prf` file, which is specific to the computer running the desktop application. It is loacated (on my Windows box) at `<home dir>\Nitrous\<box name>\.unison\default.prf`.

Here is my `default.prf`, which is tooled for my workflow on various projects with with grunt, nodeJS, WordPress, and Symfony2:
```apacheconf
# Unison preferences file
ignore=Name Thumbs.db
ignore=Path */.sass-cache
ignore=Path */app/cache
ignore=Path */node_modules
ignore=Path */phpmyadmin
ignore=Path */wp-admin
ignore=Path */wp-content/wp-uploads
ignore=Path */wp-includes
```

You could also speciy a directory to explicitly sync, such as `.git`, which is ignored by default:
```apacheconf
# Unison preferences file
ignorenot=Path */.git
```

More configuration options are available in the [Unison docs](http://www.cis.upenn.edu/~bcpierce/unison/download/releases/stable/unison-manual.html).
