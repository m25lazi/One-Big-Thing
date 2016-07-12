import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");

/**
 * CreateCommand
 * Handles /Create xxxxxxxx
 */
class CreateCommand extends Command {
    
    static command = "/CREATE"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /CREATE")
        if(!this.payload.message || this.payload.message.trim() === "")
            callback( {message : "You need to specify the item title. Eg: /Create Complete Part 1"} );
        
        Item.add(this.payload.sender, this.payload.message.trim(), (success, item) => {
            if(success){
                callback( {message : "Created!!! :)"} );
            }
            else{
                callback( {message : "Error : You have already created a task for today"} );
            }
        })
        
    }
}

export = CreateCommand