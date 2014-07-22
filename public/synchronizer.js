// =============================================================================
//  The Game Client.
// =============================================================================

define(["eventQueue"], function (EventQueue) { 

    var bind = function(that, f) {
        return function() {
            return f.apply(that, arguments);
        }
    };

    var Synchronizer = function(io, effects, gameState) {
        // Unique id, assigned by server over network
        this.id = null;
        this.state = gameState;
        this.lastSequenceNumber = 0;
        this.effects = effects;


        // Local Events that haven't been approved by the server, or 
        // haven't been injected into the state yet.
        this.events = [];
        this.remoteReplayQueue = new EventQueue();

        // Network connection.
        this.pkgs = [];
        this.io = io;
        this.socket;
        this.initialze();
    };

    Synchronizer.prototype.onWelcome = function (welcomePkg) {
        console.log("Synchronizer.prototyp.onWelcome(...): Not implemented yet...");
    };

    Synchronizer.prototype.initialze = function () {

        var io = this.io,
            socket = this.socket = io.connect('http://localhost:3000/'),
            that = this;

        socket.on("welcome", bind(this, function (data) {
            console.log(data.msg);
            this.id = data.id;
            this.onWelcome(data.connectionPkg);
        }));


        socket.on("server package", function (data) {
            // console.log(data.msg);
            that.pkgs.push(data.pkg);

        });

        socket.on("new client", function (data) {
            console.log(data.msg);
        });

        socket.on("client left", function (data) {
            console.log(data.msg);
            
        });
    };


    Synchronizer.prototype.feedEvent = function (type, data) {
        console.log("SyncStateClient.feedEvent():", type, data);
        
        // Extend the `data` object with everything needed to synchronize, and
        // create an "event-like" object `e`.
        this.lastSequenceNumber += 1;
        
        var e = data;
        e.type = type;
        e.sequenceNumber = this.lastSequenceNumber;

        this.events.push(e);
        this.socket.emit("client event", {
            "event": e
        });

        if (!this.effects[e.type]) console.log("GameClient.processEvents(): Unknown effect...");
        else this.effects[e.type].call(e, this.state);

    };

    Synchronizer.prototype.processServerPkgs =  function () {

        while(true) {
            // A package consists of a list of state updates, and 
            // a list of Events that have been incorporated 
            var pkg = this.pkgs.shift();
            if (!pkg) break;

            // Update the game state 
            var that = this;
            (pkg.entities).forEach(function (entityData) {
                that.state.update(entityData);
            });
            // Update replay queue
            var now = +new Date();
            (pkg.replayEvents).forEach(function (e) {
                if(e.clientId !== that.id) { 
                    e.time = e.time - pkg.time + now;
                    that.remoteReplayQueue.push(e);
                }
            }) 

            // Remove those local events that already have been incorporated
            var len = this.events.length,
            diff = this.lastSequenceNumber - pkg.lastSequenceNumber[this.id];
            this.events = this.events.slice(len - diff);
            this.processEvents();
        }
    };

    Synchronizer.prototype.processEvents = function () {
        this.events.forEach(bind(this, function (e) {
            if (!this.effects[e.type]) 
                console.log("GameClient.processEvents(): Unknown effect...");
            else
                this.effects[e.type].call(e, this.state);
        }));
    };

    Synchronizer.prototype.remoteReplay = function () {
        while (true) {
            var e = this.remoteReplayQueue.shift();
            if(!e) break;

            if (!this.effects[e.type]) 
                console.log("GameClient.processEvents(): Unknown effect...");
            else
                this.effects[e.type].call(e, this.state);
        }
    };

    return Synchronizer;

});

