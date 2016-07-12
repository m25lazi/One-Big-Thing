import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");

/**
 * DoneCommand
 * Handles /Done
 */
class CreateCommand extends Command {
    
    static command = "/DONE"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /DONE")
        
        Item.markDone(this.payload.sender, (success, item) => {
            if(success){
                callback( {message : "Completed!!! :)"} );
            }
            else{
                callback( {message : "Error : Either you have not created a task or is marked done."} );
            }
        })
        
    }
}

export = CreateCommand