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
    
    public handle () :  Commands.CommandResponse{
        console.log("Handling /ABOUT")
        return {message : "One Big Thing (v 0.1.20160522.pre-alpha) "}
    }
}

export = AboutCommand