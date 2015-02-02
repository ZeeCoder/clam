#Clam
#####(0.3.0-alpha2)

**An important note:** Clam is under heavy development ATM, so be
prudent in using the provided tools.

#####What is it?

Clam is a frontend toolset. It encourages organizing frontend widgets in
CommonJS modules. These modules can then be instantiated once or multiple times
on a single page, depending on whether they are "singleton" on "basic" modules.
Modules developed with the use of Clam will be 
**maintainable** and **extendable**.
The main goal of the project is to help writing js modules in an organised
manner, while staying as simple and lightweight as possible.

To use clam, you'll have to learn some naming conventions - inspired by the
[BEM](http://bem.info/) metodology -, and how to write CommonJS modules
Clam-style.

To get started, a demo application is available here:
[Clam Demo](https://github.com/ZeeCoder/clam-demo).

#####What it's not

Clam is not a frontend framework. It has nothing to do with "views" or "models"
for example. If you need them, implementing such features is up to you.

#####A quick example

Suppose we have a singleton module called "popup". Using it in an app.js file -
which is processed by browserify - would look like this:

    // Getting the module
    // We assume that we have a "clam_module" directory which contains the
    // "popup.js" module.
    var cutil = require('clam/core/util');
    var popup = require('clam_module/popup');
    
    // Instantiating the module with the default configuration.
    cutil.createPrototypes(popup);
    
    // Note: By using the "createPrototypes" helper method, the created
    // prototype will be registered to the clam container, so other modules
    // can later access it by calling: "clam_container.get('popup')".

Then a popup open button in html could look like this:

    <div class="jsm-popup__open-btn" data-jsm-popup='{"type": "contact"}'></div>

Which would open the "contact" popup. (Depending on the implementation, the same
effect could be achieved by calling the popup prototype's appropriate method,
for example: "clam_container.get('popup').open('contact')".)

#####Installation

Installation is done via [Bower](http://bower.io/).

    bower install clam

#####Full documentation (Work in progress)

- [Naming conventions](docs/naming_conventions.md)
- [Build tools](docs/build_tools.md)
- [Creating a module](docs/creating_a_module.md)
- [Extending a module](docs/extending_a_module.md)

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
