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
        callback({message : "One Big Thing \nv 20160529.alpha "})
    }
}

export = AboutCommand