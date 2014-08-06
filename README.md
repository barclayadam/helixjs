[![HelixJS](http://www.helixjs.org/images/logo-small.png)](http://www.helixjs.org)

**HelixJS** provides a solid foundation for creating rich web applications, built 
on the [Knockout](http://knockoutjs.com/) library.

HelixJS aims to provide the required structure and features required to build great
and well structured Single Page Application, building on top of 2 well known tools so
as to not throw away any of your existing code or time investment:

 * Knockout
 * Browserify

Helix provides a number of key components that are not provided by Knockout for
creating killer applications:

 * A routing engine
 * Validation
 * A number of UI components built to work from mobile to desktop

All of these features build on knockout in a natural way that does not impose too
much structure. We want you to feel like you are writing pretty plain javascript and
knockout code, not HelixJS.

##Team Members

 - Adam Barclay (adam.barclay@redsequence.com)
 - Michael Tayor (michael.taylor@redsequence.com)

##Supported Browsers

 * IE8+
 * Chrome (Latest)
 * Firefox (Latest)

Other browsers that match the feature sets of Chrome and Firefox are likely to
work as well as the other browsers, they are just not yet fully tested and
supported.

##Building HelixJs from source

If you prefer to build the library yourself:

 1. **Clone the repo from GitHub**

        git clone https://github.com/barclayadam/helixjs.git
        cd helixjs

 2. **Acquire build dependencies.** 

   Make sure you have [Node.js](http://nodejs.org/) installed on your workstation. This is only needed to _build_ Helix from sources. Helix itself has no dependency on Node.js once it is built (it works with any server technology or none). 

   HelixJS uses [Gulp](http://gulpjs.com/) as its build system, and [Browserify](http://browserify.org) for module management.

    Now run:

        npm install -g gulpjs
        npm install -g browserify
        npm install

    You might need to run these command with `sudo` if you're on Linux or Mac OS X, or in an Administrator command prompt on Windows.

 3. **Run the build tool**

        gulp

##Running tests locally

HelixJS tests are run using testling:

 1. Install testling using `npm`. This is installed globally

        npm install -g testling

 2. Run the tests locally in a headless browser:

     testling

##Typescript

HelixJS is built using [Typescript](http://www.typescriptlang.org/):

    TypeScript lets you write JavaScript the way you really want to.
    TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
    Any browser. Any host. Any OS. Open Source.

HelixJS can still be used in plain javascript projects as it is distributed as plain javascript files, in addition to
the typescript files.

TypeScript provides many benefits to large-scale javascript application development, including class syntax and
most importantly type-checking.

We use [tsd](http://definitelytyped.org/tsd/) (`TypeScript Definition manager for DefinitelyTyped`) whilst developing to grab TypeScript definition files for dependencies such as `knockout` and `tape` for testing.
     
##License

[The MIT License (MIT)](http://www.opensource.org/licenses/mit-license.php)

Copyright (c) 2014 Adam Barclay

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.