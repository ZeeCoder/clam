var cutil = require('./util');

// Constructor
// ===========
function Module($moduleObject, moduleName, defConf, conf) {
    if (typeof moduleName === 'undefined') {
        throw 'Missing module name.';
    }

    this.module = {
        $object: $moduleObject,
        name: moduleName,
        class: cutil.getModuleClass(moduleName),
        conf: {},
        type: 'prototype'
    };

    try {
        cutil.validateJQueryObject($moduleObject, 1);
    } catch (e) {
        this.error(e);
    }

    // Checking if the jQuery object has the needed jsm class
    if (!$moduleObject.hasClass(this.module.class)) {
        this.error('The given jQuery Object does not have this module\'s class.');
    }

    // Setting up default configuration
    if (defConf !== null) {
        $.extend(this.module.conf, defConf);
        // this.module.conf = _.merge(this.module.conf, defConf);
    }

    // Merging in data- configuration
    var dataConf = this.getDataConfiguration();
    $.extend(this.module.conf, dataConf);
    // this.module.conf = _.merge(this.module.conf, dataConf);
    
    // Merging in passed configuration
    if (typeof conf === 'object') {
        $.extend(this.module.conf, conf);
        // this.module.conf = _.merge(this.module.conf, conf);
    }
}

// API
//====
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

Module.prototype.findHook = function(hookName, isStrict) {
    return this.findHooks(hookName, 1, isStrict);
};

Module.prototype.findHooks = function(hookName, hookNumLimit, isStrict) {
    if (hookName == 'context') {
        throw this.error('The hook name "context" is reserved for other purposes. Please use something else.');
    }

    var
        hookClassName = this.module.class + '__' + hookName,
        $hooks,
        $inContextHooks;

    if (this.module.type == 'singleton') {
        $hooks = this.module.$object.find('.' + hookClassName);
    } else {
        $hooks =
            this.module.$object
                .find('.' + hookClassName)
                .filter(function() {
                    return $(this).closest('.' + this.module.class)[0] === this.module.$object[0];
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
