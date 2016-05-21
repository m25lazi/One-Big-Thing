import Command = require("./Command");

/**
 * HelpCommand
 * Handles /Help
 */
class HelpCommand extends Command {
    
    static command = "/HELP"
    constructor() {
        super()
    }
    
    public handle () : boolean {
        console.log("Handling /HELP")
        return true
    }
}

export = HelpCommand