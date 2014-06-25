
// =============================================================================
//  The Game Client.
// =============================================================================
var GameClient = function(io, effects, eventSource) {
    // Unique id, assigned by server over network
    this.id = null;
    this.state = new GameState();
    this.lastSequenceNumber = 0;
    this.eventSource = eventSource;
    this.effects = effects;

    this.avatarId = null;

    // Local Events that haven't been approved by the server, or 
    // haven't been injected into the state yet.
    this.eventQueue = [];

    // Network connection.
    this.pkgs = [];
    this.io = io;
    this.socket;
    this.initialze();
};

GameClient.prototype.initialze = function () {

    var io = this.io,
        socket = this.socket = io.connect('http://localhost:3000/'),
        that = this;

    socket.on('welcome', bind(this, function (data) {
        console.log(data.msg);
        this.id = data.id;
    }));

    socket.on('server package', function (data) {
        console.log(data.msg);
        that.pkgs.push(data.pkg);

    });

    // =======================================================
    socket.on("new player", function (data) {
        console.log(data.msg);
    });

    socket.on("player left", function (data) {
        console.log(data.msg);
    });
    // =======================================================

    this.eventSource.on("mouseup", bind(this, function (data) {
        socket.emit("click", {
            msg: "Client " + this.id +  " clicked",
            event: update(data, {type: "click"})
        });  
    }));

    this.eventSource.onAny(bind(this, function (type, data) {
        console.log("Event:", type, data)
        this.fireEvent(type, data);
    }));
};

GameClient.prototype.fireEvent = function (type, data) {
    console.log("GameClient.fireEvent():", type, data)
    // Extend the `data` object with everything needed to synchronize, and
    // create an "event-like" object `e`.
    this.lastSequenceNumber += 1;
    var e = update(data, {
        type: type,
        sequenceNumber: this.lastSequenceNumber,
        entityId: this.id
    });
    this.eventQueue.push(e);
    this.socket.emit("client event", {
        "event": e
    });

    if (!this.effects[e.type]) console.log("GameClient.processEvents(): Unknown effect...");
    else this.effects[e.type].call(e, this.state);

};

GameClient.prototype.processServerPkgs =  function () {

    while(true) {
        // A package consists of a list of state updates, and 
        // a list of Events that have been incorporated 
        var pkg = this.pkgs.shift();
        if (!pkg) break;

        // Update the game state 
        var that = this;
        (pkg.entities).forEach(function (entity) {
            that.state.updateEntity(entity);
        });
        // Remove those local events that already have been incorporated
        var len = this.eventQueue.length,
        diff = this.lastSequenceNumber - pkg.lastSequenceNumber[this.id];
        this.eventQueue = this.eventQueue.slice(len - diff);
        this.processEvents();
    }
};

GameClient.prototype.processEvents = function () {
    this.eventQueue.forEach(bind(this, function (e) {
        if (!this.effects[e.type]) 
            console.log("GameClient.processEvents(): Unknown effect...");
        else
            this.effects[e.type].call(e, this.state);
    }));
};


