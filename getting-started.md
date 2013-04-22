---
layout: default
title: HelixJS - Getting Started
---

# Getting Started

Being a JavaScript project we like to use JavaScript in our tool chain wherever possible. We use [Node.js](http://nodejs.org) and [Grunt CLI](http://gruntjs.com) to help automate tasks.

To setup HelixJS do the following:

## Setup using Chocolatey (Windows)

Use the Windows package manager [Chocolatey](http://chocolatey.org/) to make installation process less painful.

- Clone [HelixJS](https://github.com/barclayadam/helixjs) in GitHub.
- Navigate to your cloned HelixJS folder and then to the setup folder.
- Run each batch file in numerical order.

Note: Sometimes you may need to close all Windows Explorer and Command Prompt windows in order to get the PATH to update to reference [Node.js](http://nodejs.org).

## Manual setup (Windows and Non-Windows)

- Clone [HelixJS](https://github.com/barclayadam/helixjs) in GitHub.
- Install [Node.js](http://nodejs.org) v0.8 or higher.
- Make sure [Node.js](http://nodejs.org) is accessible from your CLI. On Windows make sure the [Node.js](http://nodejs.org) folder is added to your PATH.
- Navigate to your cloned HelixJS folder and then to the setup folder.
- Using your CLI, install package dependencies using [npm](http://npmjs.org):

{% highlight powershell %}
npm install
{% endhighlight %}

- Install [Grunt CLI](http://gruntjs.com) using [npm](http://npmjs.org):

{% highlight powershell %}
npm install grunt-cli -g
{% endhighlight %}

- Optional: Set your [Sauce Labs](https://saucelabs.com) Access Key.

## Running the Test Suite

HelixJS is tested using [Jasmine](http://pivotal.github.io/jasmine). To run the specs navigate to the HelixJS folder using your CLI and enter:

{% highlight powershell %}
grunt
start http://localhost:9001/spec/runner.html
{% endhighlight %}

If you are using Windows you can do the following from Windows Explorer:

{% highlight powershell %}
watch.bat
specs-in-browser.bat
{% endhighlight %}

Everything should hopefully go green!