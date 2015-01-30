'use strict';
var $ = require('jquery');

module.exports = {
    modules: {},

    add: function(clam_module) {
        var moduleName;
        if ($.isArray(clam_module)) {
            moduleName = clam_module[0].module.name;
        } else {
            moduleName = clam_module.module.name;
        }

        if (typeof this.modules[moduleName] !== 'undefined') {
            if ($.isArray(this.modules[moduleName]) && $.isArray(clam_module)) {
                $.merge(this.modules[moduleName], clam_module);
            } else {
                throw 'The "' + moduleName + '" key is already set in the container. Adding the module to the container failed.';
            }
        } else {
            this.modules[moduleName] = clam_module;
        }
    },

    get: function(moduleName) {
        if (typeof this.modules[moduleName] === 'undefined') {
            throw 'Nothing is set under the "' + moduleName + '" key in the container.';
        }

        return this.modules[moduleName];
    },

    expose: function() {
        window.container = this;
        console.warn('The clam container is now exposed as "container".');
    }
};
