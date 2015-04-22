'use strict';
var cutil = require('./util');
var clam_container = require('./container');
var $ = require('jquery');
var q = require('q');

/**
 * @constructor
 * @param {jQuery} $object A jQuery object with a length of 1. It must have
 * the module's classname.
 * @param {Object} [settings] The Module settings. (Example keys: "type",
 * "hasGlobalHooks", "conf".)
 * @param {Object} [conf] The configuration Object.
 */
function Module($object, settings, conf) {
    var moduleName = cutil.getModuleName(this);
    var className = cutil.getModuleClass(moduleName);

    var depth = 1;
    if (typeof settings.hasGlobalHooks === 'undefined') {
        settings.hasGlobalHooks = false;
    }
    // Converting possible thruthy values to true
    settings.hasGlobalHooks = !!settings.hasGlobalHooks;

    if (settings.type !== 'singleton') {
        settings.type = 'basic';

        depth = $object.parents('.' + className).length + 1;
    } else {
        // Check whether the module can be a singleton or not
        var classElementCount = $('.' + className).length;
        if (classElementCount > 1) {
            throw 'The module' + ' [' + moduleName + '] ' + 'could not be instantiated as a singleton. ' + classElementCount + ' DOM elements were found with the "' + className + '" class instead of just one.';
        }
    }

    this.module = {
        $object: $object,
        name: moduleName,
        class: className,
        conf: {},
        events: {},
        hooks: {},
        type: settings.type,
        depth: depth,
        hasGlobalHooks: settings.hasGlobalHooks
    };

    try {
        cutil.validateJQueryObject($object, 1);
    } catch (e) {
        console.error(e);
    }

    // Checking if the jQuery object has the needed jsm class
    if (!$object.hasClass(this.module.class)) {
        console.error('The given jQuery Object does not have this module\'s class.');
    }

    // Setting up default configuration
    if (settings.conf !== null) {
        $.extend(true, this.module.conf, settings.conf);
    }

    // Merging in data- configuration
    $.extend(true, this.module.conf, this.getDataConfiguration());

    // Merging in passed configuration
    if (typeof conf === 'object') {
        $.extend(true, this.module.conf, conf);
    }
};

// API
//====
// Module.prototype.destroy = function(removeDOM) {
//     if (removeDOM) {
//         this.module.$object.remove();
//     }

//     clam_container.removeModule(this);
//     // clam_container.clean(this.module.name);
// };

Module.prototype.ns = function(eventNames) {
    var self = this;
    var eventArray = eventNames.split(' ');
    eventArray = eventArray.map(function(eventName) {
        return eventName + '.' + self.module.class.replace('-', '_');
    });

    return eventArray.join(' ');
};

Module.prototype.addEventListener = function(eventName, callback) {
    this.module.events[eventName] = callback;
};

Module.prototype.getModuleName = function() {
    return cutil.getModuleName(this);
};

Module.prototype.triggerEvent = function(eventName, args) {
    if (typeof this.module.events[eventName] !== 'function') {
        return this.getPromise();
    }

    var functionReturn = this.module.events[eventName].apply(this, args);
    if (!q.isPromise(functionReturn)) {
        var deferred = q.defer();
        if (functionReturn === undefined) {
            // No return value was given, so we assume the flow should not be
            // interrupted
            functionReturn = true;
        }
        deferred.resolve(!functionReturn);
        functionReturn = deferred.promise;
    }

    return functionReturn;
};

Module.prototype.getPromise = function(isRejected) {
    var deferred = q.defer();
    if (isRejected) {
        deferred.reject();
    } else {
        deferred.resolve();
    }

    return deferred.promise;
};

Module.prototype.prettify = function(message, subject) {
    return '[' + this.module.name + (subject ? ': ' + subject: '') + '] ' + message;
};

/**
 * Gets a single - or no - hook jQuery object from the module context.
 * The found hook will be saved, using the hookName as a key. This way, only one
 * search occurs for any given hookName in the DOM tree.
 * Finding more than one hook will result in an exception. (An empty result is
 * allowed by default.)
 * @param {string} hookName The searched hook name.
 * @param {boolean} [emptyResultNotAllowed] If set to true, then not finding a hook
 * will also throw an exception.
 * @return {jQuery} Clam hook.
 */
Module.prototype.getHook = function(hookName, emptyResultNotAllowed) {
    return this.getHooks(hookName, 1, emptyResultNotAllowed);
};

/**
 * Gets any number of jQuery object - including none - from the module context.
 * The found hook will be saved, using the hookName as a key. This way, only one
 * search occurs for any given hookName in the DOM tree.
 * @param {string} hookName The searched hook name.
 * @param {int} [expectedHookNum] (optional) Defines exactly how many hook objects
 * must be returned in the jQuery collection. If given, but the found hooks
 * count does not equal that number, then an exception will be thrown.
 * @param boolean [emptyResultNotAllowed] If set to true, then not finding hooks
 * will also throw an exception.
 * @return {jQuery} Clam hook.
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
 * @param {string} hookName The searched hook name.
 * @param {boolean} [emptyResultNotAllowed] If set to true, then not finding a hook
 * will also throw an exception.
 * @return {jQuery} Clam hook.
 */
Module.prototype.findHook = function(hookName, emptyResultNotAllowed) {
    return this.findHooks(hookName, 1, emptyResultNotAllowed);
};


/**
 * Gets any number of jQuery object - including none - from the module context
 * using jQuery selectors. Useful when hooks can be added dinamically to the
 * module.
 * @param {string} hookName The searched hook name.
 * @param {int} [expectedHookNum] (optional) Defines exactly how many hook objects
 * must be returned in the jQuery collection. If given, but the found hooks
 * count does not equal that number, then an exception will be thrown.
 * @param {boolean} [emptyResultNotAllowed] If set to true, then not finding a hook
 * will also throw an exception.
 * @return {jQuery} Clam hook.
 */
Module.prototype.findHooks = function(hookName, expectedHookNum, emptyResultNotAllowed) {
    var self = this;
    var hookClassName = this.getHookClassName(hookName);
    var $hooks;
    var $inContextHooks;

    if (this.module.type == 'singleton') {
        if (this.module.hasGlobalHooks) {
            $hooks = $('.' + hookClassName);
        } else {
            $hooks = this.module.$object.find('.' + hookClassName);

            // Adding the main module element if it has the hook class
            if (this.module.$object.hasClass(hookClassName)) {
                $hooks = $hooks.add(this.module.$object);
            }
        }
    } else {
        // Getting all hooks in the module, excluding other instances of the
        // same module inside the current one.

        // Creating a "depthClass" to exclude the same types of modules inside
        // the actual one when searching for a hook.
        var depthClass = [];
        for (var i = this.module.depth; i >= 0; i--) {
            depthClass.push('.' + this.module.class);
        }
        depthClass = depthClass.join(' ');

        $hooks =
            this.module.$object
            .find('.' + hookClassName)
            // Excluding all hooks inside other module instances
            .not(depthClass + ' .' + hookClassName)
            // Excluding all other modules that has the hook class
            .not(depthClass + '.' + hookClassName);

        // Adding every hook outside of the module instances.
        if (this.module.hasGlobalHooks) {
            var $globalHooks =
                $('.' + hookClassName)
                // Excluding hooks from within modules
                .not('.' + this.module.class + ' .' + hookClassName)
                .not('.' + this.module.class + '.' + hookClassName);

            if ($globalHooks.length) {
                $hooks = $hooks.add($globalHooks);
            }
        }

        // Adding the main module element if it has the hook class
        if (this.module.$object.hasClass(hookClassName)) {
            $hooks = $hooks.add(this.module.$object);
        }
    }

    if (
        typeof expectedHookNum === 'number' &&
        expectedHookNum != $hooks.length
    ) {
        if (
            $hooks.length !== 0 ||
            emptyResultNotAllowed
        ) {
            console.error($hooks);
            throw 'An incorrect number of hooks were found. Expected: ' + expectedHookNum + '. Found: ' + $hooks.length + '. Hook name: "' + hookClassName + '"';
        }
    }

    return $hooks;
};

Module.prototype.getHookClassName = function(hookName) {
    return this.module.class + cutil.notation.module.separator + hookName;
};

Module.prototype.getDataConfiguration = function() {
    var dataConf = this.module.$object.data(cutil.getModuleClass(this.module.name));
    if (typeof dataConf === 'undefined') {
        dataConf = {};
    }

    if (typeof dataConf !== 'object') {
        console.error('The data-* attribute\'s content was not a valid JSON. Fetched value: ' + dataConf);
    }

    return dataConf;
};

Module.prototype.getHookConfiguration = function($hook) {
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
        window[containerName][moduleName] = this;

        console.warn('Exposed as: "' + containerName + '.' + moduleName + '".');
    } else {
        if (typeof window[containerName][moduleName] === 'undefined') {
            window[containerName][moduleName] = [];
        }

        var moduleCount = window[containerName][moduleName].length;

        window[containerName][moduleName].push(this);

        console.warn('Exposed as: "' + containerName + '.' + moduleName + '[' + moduleCount + ']".');
    }
};

// Export module
//==============
module.exports = Module;
