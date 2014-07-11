// 	=============================================================================
// 	The game entity.
// 	=============================================================================

// 	The RequireJS optimizer, as of version 1.0.3, will strip out the use of 'amdefine' below, 
// 	so it is safe to use this module for your web-based projects too.
if (typeof define !== 'function') { var define = require('amdefine')(module); }

// 	Define the module. Do not pass an module name (as this only works in the browser)
// 	If no dependencies are handed to define they will be set to ['require', 'exports', 'module'].
define(function (require) {

    // Some "private" variables
    //  =============================================================================
	var entityBlueprints = {};
    var entityComponents = {};
    var game = null;

    // The entity.
    //  =============================================================================
    var Entity =  function (type) {
        this.game = game;
        this.type = type; 
        this.components = []; 
        this.updates = []; 

        // Initialize according to the blueprint of respective type
        this.addComponent(entityBlueprints[type]);
    };

    // Endow the constructor with a possibility to set 
    // the "private" varibales above
    //  =============================================================================
    Entity.setGame = function (g) {
        game = g;
        return this;
    };

    Entity.setBlueprints = function (blueprints) {
        entityBlueprints = blueprints;
        return this;
    };

    Entity.defineBlueprint = function (type, components) {
        entityBlueprints[type] = components;
        return this;
    };

    Entity.setComponents = function (components) {
        entityComponents = components;
        return this;
    };

    Entity.defineComponent = function (type, makerFunktion) {
        entityComponents[type] = makerFunktion;
        return this;
    };

    // Define the prototype
    //  =============================================================================
    Entity.prototype.setId = function (id) {
        this.id = id;
        return this;
    };

    Entity.prototype.update = function (delta) {
        var that = this;
        this.updates.forEach(function (update) {
            update.call(that, delta);
        });

        return this;
    };

    Entity.prototype.patch = function (data) {
        var patch = function (obj, changes) {
            var type;
            for (key in changes) {
                type = Object.prototype.toString.call(obj[key]);
                if (type !== "[object Object]" || type === "[object Null]" || 
                    type !== "[object Array]"  || type === "[object Undefined]") 
                    obj[key] = changes[key]
                else 
                    patch(obj[key], changes[key]);
            }
            return obj;
        };
        patch(this, data);
        return this;
    };

    Entity.prototype.addComponent = function (types) {
        var types = types instanceof Array ? types : [types];
        
        this.components = this.components.concat(types);

        var that = this;
        types.forEach(function (type) {
            if (entityComponents[type]) 
                entityComponents[type].call(null, that);
            else 
                console.log("Entity.prototype.addComponent(): No component for this type:", type);
        });

        return this;
    };

    // This wil be the return value of the call of `require`
    //  =============================================================================
	return Entity;
});



