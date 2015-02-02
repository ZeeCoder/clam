#####The Clam Module

A Clam Module is a CommonJS module with some inherited methods.

This documentation will explain the logic behind these modules. If you want to see
code instead, please feel free to check out the demo application. 

If you use Sublime Text, then a [snippet](https://gist.github.com/ZeeCoder/29c67fd326311e40ff38) is also available for you.

#####Instantiation

A module's name must be in strict UpperCamelCase. This will be automatically
converted (When the constructor is called.) to a kebab-case for the module's
classname.

Every module must have a manifestation in the DOM. The constructor's parameters
are reflections of this fact, since the first must be a jQuery Object, and the
second is an optional configuration object.

The core module's constructor must be called in the module's constructor, which
will look something like this:
`clam_module.apply(this, [$jQObj, settings, conf]);`

Here the "$jQObj" is the first parameter of the module's constructor, the "conf"
is the second, while the "settings" is a variable in the module's scope.

The settings object can contain the following:
"type", "hasGlobalHooks", "conf".

If type is omitted, it will automatically be a "basic" type, which means, that
a single page can contain any number of instances of that module. The type can
also be a "singleton" which means that only one instance is allowed of that
module on a page. (This is checked when the constructor is called.)

To understand the "hasGlobalHooks" setting, knowing the "getHook(s)" method is
crucial. Every hook can be accessed in the module's scope (Which scope is a
DOM subtree starting with the element having the module's class as root.) with the
"getHook" and "getHooks" method. The first will only accept one hook in the
module, while the second will accept any number. These methods will search only
in the module's scope, so in this sense these hooks are "locale" to the module.
If - on the other hand - hooks must be placed outside of the module's scope (For
example in case of a popup open button.), we need "global" modules. Setting the
"hasGlobalHooks" setting to true, enables the "getHook(s)" methods to search
everywhere in the DOM tree for the given hook. It's worth noting, that in case
of a basic module the global hooks are shared between the prototypes. So when
any instance of a basic module calls a "getHook('hook-name')" for example,
it will return the same global hook.

#####Configuration
The clam modules can be configured three ways:
 - default configuration
 - data-* configuration
 - passed as the second parameter of the constructor

The data-* configuration will overwrite the default configuration, and the
constructor parameter will overwrite the data-* configuration. This is useful,
when a module must operate in different ways. This way it can be configured from
the backend (data-*) or the frontend too.

Configuration can be passed to a hook too, via the data-* attribute.
The "getHookConfiguration($hook)" method will get the data-[classname] attribute's
content (Where $hook is a jQuery object obtained with the getHook method.), and
decode it from JSON. 

After initializing the modules, the "this.module" variable will be available.
It basically contains the following:

```js
this.module = {
    $object: $object, // The module's jQuery object
    name: "simple-module", // The module's name
    class: "jsm-simple-module", // The module's classname
    conf: {}, // The configuration (The three type merged together.)
    type: "singleton", // "singleton" or "basic"
}
```

#####Summary

 - The module name's format and importance,
 - The "this.module" object's content,
 - Configuration options, hook configuration,
 - The "getHook(s)" method,

#####Example code

```js
var cutil = require('clam/core/util');
var clam_module = require('clam/core/module');
var inherits = require('util').inherits;

var settings = {
    type: 'singleton',
    conf: { // Default configuration
        animationSpeed: 300
    },
    hasGlobalHooks: true
};

function SimpleModule($jQObj, conf) {
    var self = this;
    clam_module.apply(this, [$jQObj, settings, conf]);
    // A helper method which exposes the module to the global scope.
    // Details will be outputted to the console.
    this.expose();

    // Adding an event to a hook in the module
    this.getHook('click-btn').on('click', $.proxy(this.onBtnClick, this));

    // Passing the hook to the method
    this.getHook('hook-with-config').on('click', function(){
        e.preventDefault();
        self.onHookWithConfigClick($(this));
    });
}

// Inheriting the core module's methods
inherits(SimpleModule, clam_module);

SimpleModule.prototype.onBtnClick = function(e) {
    e.preventDefault();
    // Do something here
};

SimpleModule.prototype.onHookWithConfigClick = function($hook) {
    var hookConf = this.getHookConfiguration($hook);
    // Do something based on the hook configuration
};

module.exports = SimpleModule;
```
