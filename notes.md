## Notes:

 - A problem occurs if you send objects with circular dependencies over the socket.
 - That's why I removed the `this.game` from `Entity` and added a `getGame()` method instead.
 - On client side another problem occured: The `updates` property of an entity contains functions, which are not send over the socket - a `null` value is send instead. Also the `updates` property should be part of the data body of an Entity since it should be filled when creating a new entity according to the blue print
 - Hence, there should be a function which creates a data object out of an entity to be send over the network.

 

