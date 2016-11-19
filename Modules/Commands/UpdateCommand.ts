import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");
import Error = require("../Error");

/**
 * UpdateCommand
 * Handles /Update xxxxxxxx
 */
class UpdateCommand extends Command {
    
    static command = "/UPDATE"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /UPDATE")
        if(!this.payload.message || this.payload.message.trim() === "")
            return callback({error: Error.Item.MissingTitle});
        
        Item.update(this.payload.sender, this.payload.message.trim(), (error, item) => {
            callback({error: error, item: item})
        })
        
    }
}

export = UpdateCommand