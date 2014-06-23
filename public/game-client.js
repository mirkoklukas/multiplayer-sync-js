
// =============================================================================
//  The Game Client.
// =============================================================================
var GameClient = function(io, effects, eventSource) {

  // Unique id, assigned by server over network
  this.id = null;
  this.t_sync = null;
  this.state = new GameState();
  this.lastSequenceNumber = 0;
  this.eventSource = eventSource;
  this.effects = effects;

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
        socket = this.socket = io.connect('http://localhost:3000/');

    socket.on('welcome', bind(this, function (data) {
        console.log(data.msg);
        this.id = data.id;
    }));

    socket.on('server package', function (data) {
        console.log(data.msg);
        this.t_sync = +new Date();
        this.pkgs.push(data.pkg);
    });

    // =======================================================
    socket.on("new player", function (data) {
        console.log(data.msg);
    });

    socket.on("player left", function (data) {
        console.log(data.msg);
    });
    // =======================================================

    this.eventSource.on("mouseup", bind(this, function (e) {
      socket.emit("click", {
        msg: "Client " + this.id +  " clicked",
        event: update(e, {type: "click"})
      });  
    }));

    this.eventSource.onAny(bind(this, function (e) {
      this.fireEvent(e);
    }))
};

GameClient.prototype.fireEvent = function (e) {
    this.lastSequenceNumber += 1;
    var event = update(e, {
      id: this.id + "<seperator>" + this.lastSequenceNumber,
      sequenceNumber: this.lastSequenceNumber
    });
    this.eventQueue.push(event);
    this.socket.emit("client event", {
      "event": event
    });
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
            diff = this.lastSequenceNumber - pkg.lastSequenceNumber[this.id]);
        this.eventQueue = this.eventQueue.slice(len - diff);

        // Remove those local events that already have been incorporated
        // (pkg.processedEvents).forEach(function (event) {
        //     var id = event.id,
        //         i = that.eventQueue.findIndex(function (event) {
        //             return event.id === id;
        //         });
        //     that.eventQueue.splice(i,1);
        // });
    }
};

GameClient.prototype.processEvents = function () {

  this.eventQueue.forEach(bind(this, function (e) {
    if (!this.effects[e.type]) 
      throw "GameClient.processEvents(): Unknown effect..."
    else
      this.effects[e.type].call(e, this.state);
  }));

};


// GameClient.prototype.processServerPkgs =  function () {
//     while(true) {
//         // A package consists of a list of state updates, and 
//         // a list of Events that have been incorporated 
//         var pkg = this.pkgs.shift();
//         if (!pkg) break;

//         // Update the game state 
//         var that = this;
//         (pkg.entities).forEach(function (entity) {
//             that.state.updateEntity(entity);
//         });
//         // Remove those local events that already have been incorporated
//         (pkg.incorporatedEvents).forEach(function (event) {
//             var id = event.id,
//                 i = that.events.findIndex(function (event) {
//                     return event.id === id;
//                 });
//             that.events.splice(i,1);
//         });
//     }
// };

