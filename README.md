#[mattross.io](http://www.mattross.io) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/) [![Build Status](https://travis-ci.org/amsross/amsross.github.io.png?branch=master)](https://travis-ci.org/amsross/amsross.github.io)

1. Install global dependencies
	```
	gem install jekyll && npm install -g bower grunt-cli
	```

2. Install project dependencies
	```
	npm install # bower assets will be installed automatically
	```

3. Fire listeners
	```
	screen -S grunt -d -m grunt dev
	screen -S jekyll -d -m jekyll serve --watch --drafts
	```

4. Do work...
	```
	vi <filename>
	git add <filenames>
	git commit
	git push origin master
	```

5. Kill listeners
	```
	screen -X -S grunt quit
	screen -X -S jekyll quit
	```

6. Final build (optional)
	```
	grunt build
	```
