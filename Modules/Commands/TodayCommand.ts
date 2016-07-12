import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");

/**
 * TodayCommand
 * Handles /Today
 */
class CreateCommand extends Command {
    
    static command = "/TODAY"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /TODAY")
        
        Item.fetch(this.payload.sender, 0, (success, item) => {
            if(success){
                if(item){
                    var message = item.text
                    if(item.done)
                        message += " (Done)" 
                    callback({message : message});
                }
                else{
                    callback({message : "Not created yet! use /create command to create new item"});
                }
            }
            else{
                callback({message : "Some Error"});
            }
        })
        
    }
}

export = CreateCommand