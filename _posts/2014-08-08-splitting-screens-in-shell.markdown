---
layout: post
title: Splitting Screens in Shell
---

### Start a fresh screen
`screen -S split`

### Split the current screen vertically or horizontally
`ctrl+a+|` or `ctrl+a+S`

### Switch to a new screen
`ctrl+a+<tab>`

### Spawn a new terminal in that screen
`ctrl+a+c`

### Save this layout so you can safely detach and reattach later
`ctrl+:layout save default`

### Close a new terminal and screen
`ctrl+a+X`
