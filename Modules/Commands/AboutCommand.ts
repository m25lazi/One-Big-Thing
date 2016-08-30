import Command = require("./Command");
import Commands = require("./CommandFactory");

/**
 * AboutCommand
 * Handles /About
 */
class AboutCommand extends Command {
    
    static command = "/ABOUT"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /ABOUT")
        callback({success: true, message : "v2016.08.5"})
    }
}

export = AboutCommand