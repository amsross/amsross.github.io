#[mattross.io](http://www.mattross.io)

[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

## Install global dependencies
`gem install jekyll && npm install -g bower grunt-cli`

## Install project dependencies
`npm install && bower install`

## Build front-end assets
`grunt`

## Compile Jekyll site
`jekyll build`

## Fire listeners
`screen -S grunt -d -m grunt dev`
`screen -S jekyll -d -m jekyll serve --watch`

## Do work...

## Kill listeners
`screen -X -S grunt quit`
`screen -X -S jekyll quit`

## Final build (optional)
`grunt build`
