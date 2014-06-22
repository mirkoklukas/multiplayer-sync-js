
// =============================================================================
//  The Game Client.
// =============================================================================
var GameClient = function(io) {

  // Unique id, assigned by server over network
  this.id = null;
  this.t_sync = null;
  this.state = new GameState();
  this.eventSource = null;

  // Local Events that haven't been approved by the server, or 
  // haven't been injected into the state yet.
  this.localEvents = [];

  // Network connection.
  this.pkgs = [];
  this.io = io;

  this.initialze();
};

GameClient.prototype.initialze = function () {
    var io = this.io,
        socket = io.connect('http://localhost:3000/');

    socket.on('welcome', function (data) {
        console.log(data.msg);
        this.id = data.id;
    });

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
        (pkg.processedEvents).forEach(function (event) {
            var id = event.id,
                i = that.localEvents.findIndex(function (event) {
                    return event.id === id;
                });
            that.localEvents.splice(i,1);
        });
    }
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

