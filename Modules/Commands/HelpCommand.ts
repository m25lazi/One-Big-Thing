import Command = require("./Command");
import Commands = require("./CommandFactory");

/**
 * HelpCommand
 * Handles /Help
 */
class HelpCommand extends Command {
    
    static command = "/HELP"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle () :  Commands.CommandResponse{
        console.log("Handling /HELP")
        return {message : "More commands - /about"}
    }
}

export = HelpCommand