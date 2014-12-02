var
    _    = require('lodash'),
    util = require('./util');

module.exports = {
    create: function(self, moduleName, defConf, conf) {
        if (moduleName === null) {
            throw util.prettify(moduleName, 'No module name parameter were given for Singleton creation.');
        }

        self.module = {
            $object: null,
            name: moduleName,
            class: util.getPrefixedModuleClass(moduleName),
            conf: {},
            type: 'singleton'
        };

        self.module.$object = $('.' + self.module.class);
        try {
            util.validateJQueryObject(self.module.$object, 1);
        } catch (e) {
            return false;
        }

        // Setting up default configuration
        if (defConf !== null) {
            self.module.conf = defConf;
        }

        // Merging in data- configuration
        var dataConf = util.getModuleDataConf(self.module);
        self.module.conf = _.merge(self.module.conf, dataConf);

        // Merging in passed configuration
        if (typeof conf === 'object') {
            self.module.conf = _.merge(self.module.conf, conf);
        }

        self.findHook = function(hookName, isStrict) {
            return util.findHooks(this.module, hookName, 1, isStrict);
        };

        self.findHooks = function(hookName, hookNumLimit, isStrict) {
            return util.findHooks(this.module, hookName, hookNumLimit, isStrict);
        };

        self.log = function(text) {
            console.log(util.prettify(this.module.name, text));
        };

        self.warn = function(text) {
            console.warn(util.prettify(this.module.name, text));
        };

        self.error = function(text) {
            throw util.prettify(this.module.name, text);
        };

        self.getHookClassName = function(hookName) {
            return self.module.class + '__' + hookName;
        };

        self.getHookConfiguration = function($hook) {
            return util.getHookConfiguration(this.module, $hook);
        };

        self.prettify = function(text) {
            return util.prettify(self.module.name, text);
        };

        self.expose = function() {
            var moduleName = self.module.name.replace(/\-/g, '_');

            if (typeof window[self.module.name] !== 'undefined') {
                self.warn("Couldn't expose module, the global variable '" + moduleName + "' is already taken.");

                return;
            }

            window[moduleName] = self;

            this.warn('This module has been exposed to the global scope as "' + moduleName + '".');
        };

        return true;
    }
};
