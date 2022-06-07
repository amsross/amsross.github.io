---
layout: post
title: Fix Windows Returns in bash Scripts
description:
---

```bash
tr -d "\r" < script.sh > tmp.sh
tr -d "\r" < tmp.sh > script.sh
rm tmp.sh
```
