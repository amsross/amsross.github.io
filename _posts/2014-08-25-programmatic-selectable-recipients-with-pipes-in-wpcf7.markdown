---
layout: post
title: Programmatic Selectable Recipients With Pipes in WPCF7
---

## WPCF7

[WordPress Contact Form 7](http://wordpress.org/plugins/contact-form-7/) is a mainstay of every WordPress developer I know. It's great for so many reasons. You don't have to build forms manually, you don't have to worry about validation, it works with other plugins like [Contact Form DB](https://wordpress.org/plugins/contact-form-7-to-database-extension/). It's just great.

## Pipes

One feature available in WPCF7 that I use frequently is [selectable recipients with pipes](http://contactform7.com/selectable-recipient-with-pipes/). It allows you to provide a drop-down menu of recipients without exposing their email addresses in your UI. As the documentation states, the standard markup would be:
{% highlight html %}
[select your-recipient "ceo@example.com"
                    "sales@example.com"
                    "support@example.com"]
{% endhighlight %}

Which outputs (sans wpcf7 classes):
{% highlight html %}
<select>
	<option value="ceo@example.com">ceo@example.com</option>
	<option value="sales@example.com">sales@example.com</option>
	<option value="support@example.com">support@example.com</option>
</select>
{% endhighlight %}

With pipes, the syntax changes to this:
{% highlight html %}
[select your-recipient "CEO|ceo@example.com"
                    "Sales|sales@example.com"
                    "Support|support@example.com"]
{% endhighlight %}

Which outputs (sans wpcf7 classes):
{% highlight html %}
<select>
	<option value="CEO">CEO</option>
	<option value="Sales">Sales</option>
	<option value="Support">Support</option>
</select>
{% endhighlight %}

So, by putting a "dummy" value in your select choices, you are protecting potentially sensitive data, in this case email addresses.

## The Problem

The problem with this, though, is that it isn't manipulatable on the back-end. At one point, this seems to have not been the case, as explored [here](http://www.leewillis.co.uk/dynamic-select-list-contact-form-7/). It seems that, back in 2012, pipes could be added by pushing them onto the end of the `WPCF7_Pipes->pipes` property. That property [is now private](http://hookr.io/classes/wpcf7_pipes/). At this point, though, if you add `"CEO|ceo@example.com"` to the option list programmatically, it will be output exactly like that (`"CEO|ceo@example.com"`), rather than being processed as a `WPCF7_Pipe`.

## add_filter

Even though we can't add `WPCF7_Pipe` objects directly to the `WPCF7_Pipes` object, we can get all of the old values and reconstruct the `WPCF7_Pipes` object with the old `WPCF7_Pipe` objects' values and the new values we wish to insert.

Here we get the old values and store them in an array for later:
{% highlight php %}
<?php
	// get the existing WPCF7_Pipe objects
	$befores = $tag['pipes']->collect_befores();
	$afters = $tag['pipes']->collect_afters();

	// add the existing WPCF7_Pipe objects to the new pipes array
	$pipes_new = array();
	for ($i=0; $i < count($befores); $i++) {
		$pipes_new[] = $befores[$i] . '|' . $afters[$i];
	}
?>
{% endhighlight %}

Here we add some new `WPCF7_Pipe` object values:
{% highlight php %}
<?php
	$pipes_new[] = $user->display_name . '|' . $user->user_email;
?>
{% endhighlight %}

Here we constuct a new `WPCF7_Pipes` object and add it to the `$tags` array to return to the form builder:
{% highlight php %}
<?php
	$tag['pipes'] = new WPCF7_Pipes($pipes_new);
?>
{% endhighlight %}

And here is a complete filter to be placed in `functions.php` which adds existing WordPress users to a dropdown:
{% highlight php %}
<?php

	function dynamic_select_list($tag, $unused) {

		$options = (array)$tag['options'];

		foreach ($options as $option) {
			if (preg_match('%^from_db:([-0-9a-zA-Z_]+)$%', $option, $matches)) {
				$from_db = $matches[1];
			}
		}

		if(!isset($from_db)) {
			return $tag;
		}

		// get the existing WPCF7_Pipe objects
		$befores = $tag['pipes']->collect_befores();
		$afters = $tag['pipes']->collect_afters();

		// add the existing WPCF7_Pipe objects to the new pipes array
		$pipes_new = array();
		for ($i=0; $i < count($befores); $i++) {
			$pipes_new[] = $befores[$i] . '|' . $afters[$i];
		}

		// Add users to the $tag values
		if($from_db === 'users') {
			$blogusers = get_users(
				array(
					'blog_id' => 1,
					'exclude' => array(1,2,4,7,342),
					'fields' => 'all_with_meta',
					'orderby' => 'display_name',
				)
			);
			usort($blogusers, create_function('$a, $b', 'if($a->last_name == $b->last_name) { return 0;} return ($a->last_name > $b->last_name) ? 1 : -1;'));

			if (!$blogusers) {
				return $tag;
			}

			foreach ($blogusers as $user) {
				$tag['raw_values'][] = $user->display_name;
				$tag['values'][] = $user->display_name;
				$tag['labels'][] = ucwords(strtolower($user->display_name));
				// add the user info for use as a new WPCF7_Pipe object
				$pipes_new[] = $user->display_name . '|' . $user->user_email;
			}
		}

		// setup all the WPCF7_Pipe objects
		$tag['pipes'] = new WPCF7_Pipes($pipes_new);

		return $tag;
	}
	add_filter('wpcf7_form_tag', 'dynamic_select_list', 10, 2);
?>
{% endhighlight %}

This gives us this new shortcode syntax, which will append the additional supplied data to whatever is retrieved in `dynamic_select_list()`, which is triggered by adding `from_db:users`:
{% highlight php %}
	[select* your-recipient from_db:users "CEO|ceo@example.com"
                    "Sales|sales@example.com"
                    "Support|support@example.com"]
{% endhighlight %}

The value of `[your-recipient]` will be the email address on the right side of the pipe, but the dummy value can be accessed as `[_raw_your-recipient]` if necessary.
