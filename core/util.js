'use strict';
var $ = require('jquery');
var container = require('./container');

module.exports = {
    // moduleConf: {
    //     prefix: 'jsm'
    // },

    // modifierConf: {
    //     prefix: {
    //         name: '--',
    //         value: '_'
    //     }
    // },

    notation: {
        module: {
            prefix: 'jsm-',
            separator: '__'
        },

        modifier: {
            prefix: 'b-',
            elementSeparator: '__',
            modifierSeparator: '--',
            valueSeparator: '_'
        }
    },

    // Creates module instances for every DOM element that has the appropriate
    // module class. If the $containerObj jQuery object is given - containing
    // one element -, then the function will look for the module classes in that
    // container.
    createPrototypes: function(module, config, $containerObj) {
        // Getting the module name, to select the DOM elements.
        var moduleName = this.getModuleName(module);
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
            if ($containerObj.hasClass(moduleClass)) {
                $modules = $modules.add($containerObj);
            }
        } else {
            $modules = $('.' + moduleClass);
        }

        // Create module instances
        var instances = [];
        if ($modules.length > 0) {
            $modules.each(function() {
                instances.push(new module($(this), config));
            });
        }

        if (instances.length > 0) {
            if (instances.length == 1 && instances[0].module.type == 'singleton') {
                instances = instances[0];
            }

            container.add(instances);

            return instances;
        }

        return null;
    },

    // Get's a modul's name from it's definition, or from a prototype
    getModuleName: function(module) {
        var funcDef = typeof module === 'function' ? String(module) : String(module.constructor);
        var funcName = funcDef.substr('function '.length);
        funcName = funcName.substr(0, funcName.indexOf('('));

        return funcName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
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

    getModuleClass: function(name) {
        return this.notation.module.prefix + name;
    },

    getModifierClass: function(baseName, modifierName, value) {
        if (typeof value !== 'string') {
            value = '';
        } else {
            value = this.notation.modifier.valueSeparator + value;
        }

        return baseName + this.notation.modifier.modifierSeparator + modifierName + value;
    },

    getClassesByPrefix: function(prefix, $jQObj) {
        var classes = $jQObj.attr('class');
        if (!classes) { // if "falsy", for ex: undefined or empty string
            return [];
        }

        classes = classes.split(' ');
        var matches = [];
        for (var i = 0; i < classes.length; i++) {
            var match = new RegExp('^(' + prefix + ')(.*)').exec(classes[i]);
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
