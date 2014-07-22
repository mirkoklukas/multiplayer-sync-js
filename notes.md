## Notes:

 - A problem occurs if you send objects with circular dependencies over the socket.
 - That's why I removed the `this.game` from `Entity` and added a `getGame()` method instead.
 - On client side another problem occured: The `updates` property of an entity contains functions, which are not send over the socket - a `null` value is send instead. Also the `updates` property should be part of the data body of an Entity since it should be filled when creating a new entity according to the blue print
 - Hence, there should be a function which creates a data object out of an entity to be send over the network.

## To do:

 - synchronize the update cycles on server and client side. I.e. the update intervall should be of the same duration.



## Literature

- Bob Nystrom, Game programming patterns, www.gameprogrammingpatterns.com


## Notes on Require-JS:
 
- Say one wants to make use of the fact that "loading" a module only creates **one** copy of it, then one needs to reference to it by the exact same name in the dependency list, i.e.: define/require(["module"]) and define/require(["./module.js"]) will create two different representatives of the module.

