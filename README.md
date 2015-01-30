#Clam
#####(0.3.0-alpha2)

**An important note:** Clam is under heavy development at the moment, so be
prudent in using the provided tools.

#####What is it?

Clam is a frontend toolset. It provides CommonJS-style modules to help develop
and organise frontend code. Modules developed with the use of Clam will be
**maintainable** and **extendable**.
The main goal of the project is to help writing js modules in an organised
manner, while staying as simple and lightweight as possible.

To use clam, you'll have to learn some naming conventions - inspired by the
[BEM](http://bem.info/) metodology -, and how to write CommonJS modules
Clam-style.

A demo application is available here:
[Clam Demo](https://github.com/ZeeCoder/clam-demo).

#####A quick example

Suppose we have a module called "popup". Using it in an app.js file - which is
processed by browserify - would look like this:

    // Getting the module
    // We assume that we have a "modules" directory which contains the "popup.js" module.
    var popup = require('modules/popup');

    // Instantiating the module
    var popup_instance = new popup($('.jsm-popup'));

    // Note: By saving the popup module reference, we could pass it to other modules
    // instantiated later in the script.

Then a popup open button in html could look like this:

    <div class="jsm-popup__context jsm-popup__open-btn" data-jsm-popup='{"target": "contact"}'></div>

Which would open the "contact" popup. The same could be achieved by calling the
saved instance's appropriate method, for example:
`popup_instance.open('contact')`.

#####Installation

Installation is done via [Bower](http://bower.io/).

    bower install clam

#####Full documentation (Work in progress)

- [Naming conventions](docs/naming_conventions.md)
- [Build tools](docs/build_tools.md)
- [Creating a module](docs/creating_a_module.md)
- [Extending a module](docs/extending_a_module.md)

(*JS documentation will follow, most likely via JSDoc.*)

#####Disclaimer
Although Clam is very lightweight, performance is not guaranteed for big
applications.
For example: if you have to make a single-page application, that is expected to
perform well under extensive use by the user over a long period of time without
reloading, please check the project's source code first, before you start using
these modules to decide whether it suits your needs.

The main focus of this project is to speed up development by the reuse of
clam-style modules.

Having said all the above, if you are used to optimizing javascript code, I
would be more than happy to accept pull requests, if that solves issues stopping
you from using Clam. :)

#####License
Released under the [MIT](LICENSE) license.
