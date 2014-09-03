---
layout: post
title: Create remote GIT repository from working directory
description: Create remote GIT repository from working directory
---

So you're just getting started with git and you've got this one repository that you're working out of. Good. Git is great for any number of reasons that I won't get into, but let's say you want to now push, pull and clone into/out of a slimmed-down remote repository instead of your working directory. Can it be done? Obviously, yes, and here's the command:

`git clone --bare . /location/of/remote/repo`


This assumes that you already have all of your work up until now added `git add .` and commited `git commit`. Now you can push to, pull from and clone out of this new remote repo! How cool is that?
