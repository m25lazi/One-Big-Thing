import Commands = require("./CommandFactory");

/**
 * Command
 * Abstract class for all types of commands
*/
abstract class Command {
    constructor(public payload : Commands.CommandPayload) {
        
    }
    
    static command : string
    
    /** 
     * Handle the command
    */
    abstract handle () : Commands.CommandResponse;
    
    static canHandle (command : string) : boolean {
        return command.trim().toUpperCase() === this.command;
    }
}


export = Command