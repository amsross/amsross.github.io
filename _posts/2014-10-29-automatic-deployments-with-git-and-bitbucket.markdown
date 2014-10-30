---
layout: post
title: Automatic Deployments With Git and Bitbucket
description: Automatic Deployments With Git and Bitbucket
---

## Deploy Endpoint in Repo

We'll put a file in the repo that Bitbucket can target to trigger an update of the production repository.

We'll call this file _`deploy.php`_:

{% highlight php %}
<?php

	// The commands
	$commands = array(
		// `umask 002` preserves desired priveleges
		'umask 002 && git reset --hard HEAD',
		'umask 002 && git pull origin master',
	);

	// Run the commands for output
	$output = '';
	foreach($commands AS $command){
		// Run it
		$tmp = shell_exec($command);
		// Output
		$output .= "{$command}\n";
		$output .= htmlentities(trim($tmp)) . "\n\n";
	}

	print_r($output);
?>
{% endhighlight %}
<cite>This method is adapted from [this gist](https://gist.github.com/oodavid/1809044#file-deploy-php) by [David King](https://github.com/oodavid).</cite>

## Bitbucket Deploy Key

In order for your production install to be able to pull code from the main repository, it will need to have a deployment key. The deployment key allows for __read-only__ access so it can pull information from the repo, but not push any changes to it.

If one does not already exist, you will need to create an SSH key:

{% highlight sh %}
ssh-keygen -t rsa -C "your_email@example.com"
{% endhighlight %}

The public key will be created in _`~/.ssh/id_rsa.pub`_. Copy the contents of this and paste it into the __Add Key__ dialog in the __Settings > Deployment Keys__ area of your repo on Bitbucket.

Bitbucket has additional details [here](https://confluence.atlassian.com/display/BITBUCKET/Use+deployment+keys).

## Bitbucket POST Hook

A new POST hook will need to be added in the __Settings > Hooks__ area of your repository. Select __POST__ from the __Select a hook__ dropdown, and then hit the __Add hook__ button.

The URL for the POST hook should be to that of your _`deploy.php`_ script. For example: __http://www.example.com/wp-content/themes/my-theme/deploy.php__.

This tells Bitbucket to POST information about the last changeset to that URL for further processing. Now, the _`deploy.php`_ script above isn't concerned with the actual information that Bitbucket posts. The only thing that matters to it is that some change has been made and that it should now get an updated version of the repo.

Bitbucket provides detailed information [here](https://confluence.atlassian.com/display/BITBUCKET/POST+hook+management).

## Optional goodies

### Git Hook

We can add a `post-merge` git hook that tells git to run a command or series of commands when new changes are merged in.

> Note: If your repo or branch is setup to rebase instead merge on pull (a la `git pull --rebase`), this hook will not be fired

Create a new git hook and make it executable:
{% highlight sh %}
touch .git/hooks/post-merge && chmod +x .git/hooks/post-merge
{% endhighlight %}


It should be updated to read as follows:
{% highlight sh %}
#!/bin/sh

# get a list of files in the changeset
changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_run() {
	# run the supplied command if the specified file is in the changeset
	echo "$changed_files" | grep --quiet "$1" && eval "$2"
}

# run `npm install` if package.json changed
check_run package.json "~/local/bin/node ~/local/bin/npm install"
# run `bower install` if `bower.json` changed
check_run bower.json "~/local/bin/node ~/local/bin/bower install"
# run `grunt` if anything changed
check_run assets "~/local/bin/node ~/local/bin/grunt build"
{% endhighlight %}
<cite>This method is adapted from [this gist](https://gist.github.com/sindresorhus/7996717#file-post-merge) by [Sindre Sorhus](https://github.com/sindresorhus).</cite>

### NodeJS

If we're executing things like grunt tasks, then we will need to have node installed and ready.

If the production site is hosted on a VPS or some other sort of managed server, simply follow the standard installation method [here](http://nodejs.org/download/). If, however, the production site will be hosted on a shared server, node will need to be installed in the hosting account's home directory.

{% highlight sh %}
echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
. ~/.bashrc
mkdir ~/local
mkdir ~/node-latest-install
cd ~/node-latest-install
curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
./configure --prefix=~/local
make install # ok, fine, this step probably takes more than 30 seconds...
curl https://www.npmjs.org/install.sh | sh
{% endhighlight %}
<cite>This method is taken from [this gist](https://gist.github.com/isaacs/579814#file-node-and-npm-in-30-seconds-sh) by [Isaac Shlueter](https://github.com/isaacs).</cite>
