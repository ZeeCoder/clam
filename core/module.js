var cutil = require('./util');

// Constructor
// ===========
function Module($object, settings, conf) {
    if (typeof settings.name === 'undefined') {
        throw 'Missing module name.';
    }

    if (settings.type !== 'singleton') {
        settings.type = 'prototype';
    }

    this.module = {
        $object: $object,
        name: settings.name,
        class: cutil.getModuleClass(settings.name),
        conf: {},
        events: {},
        hooks: {},
        type: settings.type
    };

    try {
        cutil.validateJQueryObject($object, 1);
    } catch (e) {
        this.error(e);
    }

    // Checking if the jQuery object has the needed jsm class
    if (!$object.hasClass(this.module.class)) {
        this.error('The given jQuery Object does not have this module\'s class.');
    }

    // Setting up default configuration
    if (settings.conf !== null) {
        $.extend(this.module.conf, settings.conf);
    }

    // Merging in data- configuration
    $.extend(this.module.conf, this.getDataConfiguration());
    
    // Merging in passed configuration
    if (typeof conf === 'object') {
        $.extend(this.module.conf, conf);
    }
};

// API
//====
Module.prototype.addHookEvent = function(hookName, eventType, addPrePostEvents) {
    var self = this;
    var $hook = this.getHooks(hookName);
    if ($hook.length === 0) {
        return false;
    }

    var eventName = hookName.split('-');
    eventName.push(eventType);
    var eventNameLength = eventName.length;
    for (var i = eventNameLength - 1; i >= 0; i--) {
        eventName[i] = cutil.ucfirst(eventName[i]);
    };
    var eventName = eventName.join('');

    $hook.each(function() {
        $(this).on(eventType, function(e) {
            if (addPrePostEvents) {
                self.triggerEvent('pre' + eventName, [e, $(this)]);
            }
            self['on' + eventName].apply(self, [e, $(this)]);
            if (addPrePostEvents) {
                self.triggerEvent('post' + eventName, [e, $(this)]);
            }
        });
    });
};

Module.prototype.prettifyLog = function(text) {
    return '[' + this.module.name + '] ' + text;
};

Module.prototype.log = function(text) {
    console.log(this.prettifyLog(text));
};

Module.prototype.warn = function(text) {
    console.warn(this.prettifyLog(text));
};

Module.prototype.error = function(text) {
    throw this.prettifyLog(text);
};

Module.prototype.addEventListener = function(eventName, callback) {
    this.module.events[eventName] = callback;
};

Module.prototype.triggerEvent = function(eventName, args) {
    if (typeof this.module.events[eventName] !== 'function') {
        return false;
    }

    this.module.events[eventName].apply(this, args);
};

/**
 * Gets a single - or no - hook jQuery object from the module context.
 * The found hook will be saved, using the hookName as a key. This way, only one
 * search occurs for any given hookName in the DOM tree.  
 * Finding more than one hook will result in an exception. (An empty result is
 * allowed by default.)
 * @param string hookName The searched hook name.
 * @param boolean emptyResultNotAllowed If set to true, then not finding a hook
 * will also throw an exception.
 * @return jQuery Object (Clam Hook)
 */
Module.prototype.getHook = function(hookName, emptyResultNotAllowed) {
    return this.getHooks(hookName, 1, emptyResultNotAllowed);
};

/**
 * Gets any number of jQuery object - including none - from the module context.
 * The found hook will be saved, using the hookName as a key. This way, only one
 * search occurs for any given hookName in the DOM tree.
 * @param string hookName The searched hook name.
 * @param int expectedHookNum (optional) Defines exactly how many hook objects
 * must be returned in the jQuery collection. If given, but the found hooks
 * count does not equal that number, then an exception will be thrown. 
 * @param boolean emptyResultNotAllowed If set to true, then not finding hooks
 * will also throw an exception.
 * @return jQuery Object (Clam Hook)
 */
Module.prototype.getHooks = function(hookName, expectedHookNum, emptyResultNotAllowed) {
    if (typeof this.module.hooks[hookName] === 'undefined') {
        this.module.hooks[hookName] = this.findHooks(hookName, expectedHookNum, emptyResultNotAllowed);
    }

    return this.module.hooks[hookName];
};

/**
 * Gets a single - or no - hook jQuery object from the module context using
 * jQuery selectors. Useful when hooks can be added dinamically to the module.
 * Finding more than one hook will result in an exception. (An empty result is
 * allowed by default.)
 * @param string hookName The searched hook name.
 * @param boolean emptyResultNotAllowed If set to true, then not finding a hook
 * will also throw an exception.
 * @return jQuery Object (Clam Hook)
 */
Module.prototype.findHook = function(hookName, emptyResultNotAllowed) {
    return this.findHooks(hookName, 1, emptyResultNotAllowed);
};


/**
 * Gets any number of jQuery object - including none - from the module context
 * using jQuery selectors. Useful when hooks can be added dinamically to the
 * module.
 * @param string hookName The searched hook name.
 * @param int expectedHookNum (optional) Defines exactly how many hook objects
 * must be returned in the jQuery collection. If given, but the found hooks
 * count does not equal that number, then an exception will be thrown. 
 * @return jQuery Object (Clam Hook)
 */
Module.prototype.findHooks = function(hookName, expectedHookNum, emptyResultNotAllowed) {
    if (hookName == 'context') {
        throw this.error('The hook name "context" is reserved for other purposes. Please use something else.');
    }

    var hookClassName = this.module.class + '__' + hookName;
    var $hooks;
    var $inContextHooks;
    var self = this;


    if (this.module.type == 'singleton') {
        $hooks = this.module.$object.find('.' + hookClassName);
    } else {
        $hooks =
            this.module.$object
                .find('.' + hookClassName)
                .filter(function() {
                    return $(this).closest('.' + self.module.class)[0] === self.module.$object[0];
                });
    }

    if (this.module.$object.hasClass(hookClassName)) {
        $hooks = $hooks.add(this.module.$object);
    }

    var $moduleContexts = $('.' + this.module.class + '__context');
    $.each($moduleContexts, function() {
        if (self.module.type == 'singleton') {
            $inContextHooks = $(this).find('.' + hookClassName);
        } else {
            $inContextHooks =
                $(this)
                .find('.' + hookClassName)
                .filter(function() {
                    console.log(this);
                    return $(this).closest('.' + this.module.class)[0] === this.module.$object[0];
                });
        }
                
        if ($inContextHooks.length) {
            $hooks = $hooks.add($inContextHooks);
        }

        if ($(this).hasClass(hookClassName)) {
            $hooks = $hooks.add($(this));
        }
    });

    if (
        typeof expectedHookNum === 'number' &&
        expectedHookNum != $hooks.length
    ) {
        if (
            $hooks.length !== 0 ||
            emptyResultNotAllowed
        ) {
            throw this.prettifyLog('An incorrect number of hooks were found. Expected: ' + expectedHookNum + '. Found: ' + $hooks.length + '. Hook name: "' + hookClassName + '"');
        }
    }

    return $hooks;
};

Module.prototype.getHookClassName = function(hookName) {
    return this.module.class + '__' + hookName;
};

Module.prototype.getDataConfiguration = function() {
    var dataConf = this.module.$object.data(cutil.getModuleClass(this.module.name));
    if (typeof dataConf === 'undefined') {
        dataConf = {};
    }

    if (typeof dataConf !== 'object') {
        this.error('The data-* attribute\'s content was not a valid JSON. Fetched value: ' + dataConf);
    }

    return dataConf;
};

Module.prototype.getHookConfiguration = function($hook) {
    try {
        cutil.validateJQueryObject($hook, 1)
    } catch (e) {
        this.error(e);
    }

    return $hook.data(this.module.class);
};

Module.prototype.expose = function(containerName) {
    if (typeof containerName === 'undefined') {
        containerName = 'exposed_modules';
    }
    
    if (typeof window[containerName] === 'undefined') {
        window[containerName] = {};
    }

    var moduleName = this.module.name.replace(/\-/g, '_');

    if (this.module.type == 'singleton') {
        // Expose singleton
        window[containerName][moduleName] = this;

        this.warn('Exposed as: "' + containerName + '.' + moduleName + '".');
    } else {
        // Expose prototype
        if (typeof window[containerName][moduleName] === 'undefined') {
            window[containerName][moduleName] = [];
        }

        moduleCount = window[containerName][moduleName].length;

        window[containerName][moduleName].push(this);

        this.warn('Exposed as: "' + containerName + '.' + moduleName + '[' + moduleCount + ']".');
    }
};

// Export module
//==============
module.exports = Module;
