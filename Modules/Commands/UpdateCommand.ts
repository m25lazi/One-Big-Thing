import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");

/**
 * UpdateCommand
 * Handles /Update xxxxxxxx
 */
class CreateCommand extends Command {
    
    static command = "/UPDATE"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /UPDATE")
        if(!this.payload.message || this.payload.message.trim() === "")
            return callback( {message : "You need to specify the item title. Eg: /Update Complete Part 2"} );
        
        Item.update(this.payload.sender, this.payload.message.trim(), (success, item) => {
            if(success){
                callback( {message : "Updated!!! :)"} );
            }
            else{
                callback( {message : "Error : Either you have not created a task or is marked done."} );
            }
        })
        
    }
}

export = CreateCommand