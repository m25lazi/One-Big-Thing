import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");

/**
 * DoneCommand
 * Handles /Done
 */
class DoneCommand extends Command {
    
    static command = "/DONE"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /DONE")
        
        Item.markDone(this.payload.sender, (error, item) => {
            callback({error: error, item: item})
        })
        
    }
}

export = DoneCommand