---
layout: post
title: Find & Replace a String in MySQL
description: Find & Replace a String in MySQL
---

{% highlight mysql linenos %}
update `table_name`
set `field_name` = replace(
	`field_name`,
	'string_to_find',
	'string_to_replace'
);
{% endhighlight %}
