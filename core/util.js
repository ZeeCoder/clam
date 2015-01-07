module.exports = {
    moduleConf: {
        prefix: 'jsm'
    },

    modifierConf: {
        prefix: {
            name: '--',
            value: '_'
        }
    },

    createPrototypesByArray: function(moduleArray, conf, $containerObj) {
        var length = moduleArray.length;
        for (var i = length - 1; i >= 0; i--) {
            this.createPrototypes(moduleArray[i], conf, $containerObj);
        }
    },

    // Creates module instances for every DOM element that has the appropriate
    // module class. If the $containerObj jQuery object is given - containing
    // one element -, then the function will look for the module classes in that
    // container.
    createPrototypes: function(module, config, $containerObj) {
        // Getting the module name, to select the DOM elements.
        var errorText;
        try {
            new module($('<div/>'));
        } catch (e) {
            errorText = e;
        }

        var moduleName = this.getModuleNameByErrorText(errorText);
        var moduleClass = this.getModuleClass(moduleName);

        if (
            typeof config === 'undefined' ||
            !config // falsy values
        ) {
            config = {};
        }

        // Get appropriate module DOM objects
        var $modules = null;
        if (typeof $containerObj !== 'undefined') {
            this.validateJQueryObject($containerObj);
            $modules = $containerObj.find('.' + moduleClass);
        } else {
            $modules = $('.' + moduleClass);
        }

        // Create module instances
        var self = this;
        if ($modules.length > 0) {
            $modules.each(function() {
                new module($(this), config);
            });
        }
    },

    initiateSingleton: function(singleton) {
        try {
            singleton.getInstance();
        } catch (e) {
            errorText = e;
        }

        var moduleName = this.getModuleNameByErrorText(errorText);
        var moduleClass = this.getModuleClass(moduleName);

        singleton.getInstance($('.' + moduleClass));
    },

    initiateSingletonsByArray: function(singletonArray) {
        if (
            typeof singletonArray !== 'object' ||
            singletonArray instanceof Array === false
        ) {
            throw '[initiateSingletonsByArray] The method expects an array of singletons as parameter.';
        }

        var length = singletonArray.length;
        for (var i = length - 1; i >= 0; i--) {
            this.initiateSingleton(singletonArray[i]);
        }
    },

    getModuleNameByErrorText: function(text) {
        return text.substr(1, text.indexOf(']') - 1);
    },

    // Checks whether the given collection is a valid jQuery object or not.
    // If the collectionSize (integer) parameter is specified, then the
    // collection's size will be validated accordingly.
    validateJQueryObject: function($collection, collectionSize) {
        if (
            typeof collectionSize !== 'undefined' &&
            typeof collectionSize !== 'number'
        ) {
            throw 'The given "collectionSize" parameter for the jQuery collection validation was not a number. Passed value: ' + collectionSize + ', type: ' + (typeof collectionSize) + '.';
        }

        
        if ($collection instanceof jQuery === false) {
            throw 'This is not a jQuery Object. Passed type: ' + (typeof $collection);
        }

        if (
            typeof collectionSize !== 'undefined' &&
            $collection.length != collectionSize
        ) {
            throw 'The given jQuery collection contains an unexpected number of elements. Expected: ' + collectionSize + ', given: ' + $collection.length + '.';
        }
    },

    ucfirst: function(string) {
        return string.charAt(0).toUpperCase() + string.substr(1);
    },

    singletonify: function(Module, privateModuleScope) {
        return {
            getInstance: function($jQObj, conf) {
                if (!privateModuleScope.instance) {
                    privateModuleScope.instance = new Module($jQObj, conf);
                    privateModuleScope.instance.module.type = 'singleton';
                }

                return privateModuleScope.instance;
            }
        };
    },

    getModuleClass: function(name) {
        return this.moduleConf.prefix + '-' + name;
    },

    getModifierClass: function(baseName, modifierName, value) {
        if (typeof value !== 'string') {
            value = '';
        } else {
            value = this.modifierConf.prefix.value + value;
        }

        return baseName + this.modifierConf.prefix.name + modifierName + value;
    },

    getClassesByPrefix: function(prefix, $jQObj) {
        var classes = $jQObj.attr('class');
        if (!classes) { // if "falsy", for ex: undefined or empty string
            return [];
        }

        classes = classes.split(' ');
        var matches = [];
        for (var i = 0; i < classes.length; i++) {
            match = new RegExp('^(' + prefix + ')(.*)').exec(classes[i]);
            if (match != null) {
                matches.push(match[0]);
            }
        }

        return matches;
    },

    removeClassesByPrefix: function(prefix, $jQObj) {
        var matches = this.getClassesByPrefix(prefix, $jQObj);
        matches = matches.join(' ');
        $jQObj.removeClass(matches);
    }
};
