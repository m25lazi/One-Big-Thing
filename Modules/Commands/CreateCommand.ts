import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");
import Error = require("../Error");

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
            return callback({error: Error.Item.MissingTitle});
        
        Item.add(this.payload.sender, this.payload.message.trim(), (error, item) => {
            callback({error: error, item: item})
        })
        
    }
}

export = CreateCommand