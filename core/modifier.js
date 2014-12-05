var cutil = require('./util');

// Constructor
// ===========
function Modifier($object, name, prefix) {
    if (typeof prefix !== 'string') {
        prefix = 'b';
    }

    // Attributes
    this.modifier = {
        $object: $object,
        prefix: prefix,
        name: name,
        prefixedName: prefix + '-' + name
    };

    cutil.validateJQueryObject($object, 1);
}

// API
//====
Modifier.prototype.on = function(name) {
    return this.set(name, true);
};

Modifier.prototype.off = function(name) {
    return this.set(name, false);
};

Modifier.prototype.toggle = function(name) {
    if (this.get(name)) {
        return this.set(name, false);
    }

    return this.set(name, true);
};

// Gets a modifier on a BEM object.
Modifier.prototype.get = function(name) {
    var modPrefix = this.typeID;
    var modifierClass = cutil.getModifierClass(this.modifier.prefixedName, name);

    var classes = cutil.getClassesByPrefix(modifierClass, this.modifier.$object);
    // Modifier not found
    if (classes.length === 0) {
        return false;
    }

    value = classes[0].split('_');

    // Modifier found, but doesn't have a specific value
    if (typeof value[1] == 'undefined') {
        return true;
    }

    // Modifier found with a value
    return value[1];
};

// Sets a modifier on a BEM object.
Modifier.prototype.set = function(name, value) {
    if (
        typeof value != 'string' &&
        typeof value != 'boolean'
    ) {
        throw 'A BEM modifier value can only either be "string", or "boolean". The given value was of type "' + (typeof value) + '".';
    }

    var modifierClass = cutil.getModifierClass(this.modifier.prefixedName, name);
    cutil.removeClassesByPrefix(modifierClass, this.modifier.$object);
    if (value !== false) {
        modifierClass = cutil.getModifierClass(this.modifier.prefixedName, name, value);
        this.modifier.$object.addClass(modifierClass);
    }

    return this;
};

// Export module
//==============
module.exports = Modifier;
