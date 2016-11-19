import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");

/**
 * TodayCommand
 * Handles /Today
 */
class TodayCommand extends Command {
    
    static command = "/TODAY"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /TODAY")
        
        Item.fetch(this.payload.sender, 0, (error, item) => {
            callback({error: error, item: item})
        })
        
    }
}

export = TodayCommand