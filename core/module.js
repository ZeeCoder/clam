var cutil = require('./util');

// Constructor
// ===========
function Module($object, settings, conf) {
    if (typeof settings.name === 'undefined') {
        throw 'Missing module name.';
    }

    this.module = {
        $object: $object,
        name: settings.name,
        class: cutil.getModuleClass(settings.name),
        conf: {},
        events: {},
        hooks: {},
        type: 'prototype'
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
    if (settings.defConf !== null) {
        $.extend(this.module.conf, settings.defConf);
    }

    // Merging in data- configuration
    var dataConf = this.getDataConfiguration();
    $.extend(this.module.conf, dataConf);
    
    // Merging in passed configuration
    if (typeof conf === 'object') {
        $.extend(this.module.conf, conf);
    }

    // Registering events
    this.registerEvents(settings.events);

    // Registering hooks
    this.registerHooks(settings.hooks);

    try {
        // Calling hook initialization, if the function exists
        if (typeof this.initializeHooks === 'function') {
            this.initializeHooks();
        }

        // Calling property initialization, if the function exists
        if (typeof this.initializeProperties === 'function') {
            this.initializeProperties();
        }
    } catch (e) {
        this.error(e);
    }
};

// API
//====
Module.prototype.registerEvents = function(events) {
    if (
        typeof events === 'undefined' ||
        events instanceof Array === false
    ) {
        return false;
    }

    var eventsLength = events.length;
    for (var i = eventsLength - 1; i >= 0; i--) {
        this.module.events[events[i]] = null;
    };
};

Module.prototype.registerHooks = function(hookNames) {
    if (
        typeof hookNames === 'undefined' ||
        hookNames instanceof Array === false
    ) {
        return false;
    }

    var hookNamesLength = hookNames.length;
    for (var i = hookNames.length - 1; i >= 0; i--) {
        this.module.hooks[hookNames[i]] = null;
    };
};

Module.prototype.getHook = function(hookName) {
    if (typeof this.module.hooks[hookName] === 'undefined') {
        this.error('No hook named "' + hookName + '" was registered to the module.');
    }
    if (this.module.hooks[hookName] === null) {
        this.module.hooks[hookName] = this.findHooks(hookName);
    }

    return this.module.hooks[hookName];
};

Module.prototype.addHookEvent = function(hookName, eventType, registerEvents) {
    var self = this;
    var $hook = this.getHook(hookName);
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

    if (registerEvents) {
        self.registerEvents([
            'pre' + eventName,
            'post' + eventName
        ]);
    }

    $hook.on(eventType, function(){
        if (registerEvents) {
            self.triggerEvent('pre' + eventName, arguments);
        }
        self['on' + eventName].apply(self, arguments);
        if (registerEvents) {
            self.triggerEvent('post' + eventName, arguments);
        }
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
    if (typeof this.module.events[eventName] === 'undefined') {
        this.error('The event called "' + eventName + '" does not exist.');

        return false;
    }

    this.module.events[eventName] = callback;
};

Module.prototype.triggerEvent = function(eventName, args) {
    if (typeof this.module.events[eventName] === 'undefined') {
        this.warn('Could not trigger the event called: "' + eventName + '", such an event was not registered.');

        return false;
    }

    if (typeof this.module.events[eventName] !== 'function') {
        return false;
    }

    if (args instanceof Array === false) {
        args = [args];
    }

    this.module.events[eventName].apply(this, args);
};


Module.prototype.findHook = function(hookName, isStrict) {
    return this.findHooks(hookName, 1, isStrict);
};

Module.prototype.findHooks = function(hookName, hookNumLimit, isStrict) {
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
        if (this.module.type == 'singleton') {
            $inContextHooks = $(this).find('.' + hookClassName);
        } else {
            $inContextHooks =
                $(this)
                .find('.' + hookClassName)
                .filter(function() {
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
        typeof hookNumLimit === 'number' &&
        hookNumLimit != $hooks.length
    ) {
        if (
            $hooks.length !== 0 ||
            isStrict
        ) {
            throw this.prettifyLog('An incorrect number of hooks were found. Expected: ' + hookNumLimit + '. Found: ' + $hooks.length + '. Hook name: "' + hookClassName + '"');
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
        window[containerName][this.module.name] = this;

        this.warn('Exposed as: "' + containerName + '.' + moduleName + '".');
    } else {
        // Expose prototype
        if (typeof window[containerName][this.module.name] === 'undefined') {
            window[containerName][this.module.name] = [];
        }

        moduleCount = window[containerName][this.module.name].length;

        window[containerName][this.module.name].push(this);

        this.warn('Exposed as: "' + containerName + '.' + moduleName + '[' + moduleCount + ']".');
    }
};

// Export module
//==============
module.exports = Module;
