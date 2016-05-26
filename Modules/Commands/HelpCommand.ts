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
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /HELP")
        callback( {message : "More commands - /about, /create, /done, /help, /today, /update"} )
    }
}

export = HelpCommand