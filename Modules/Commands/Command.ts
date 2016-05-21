import CommandFactory = require("./CommandFactory");

/**
 * Command
 * Abstract class for all types of commands
*/
abstract class Command {
    constructor() {
        
    }
    
    static command : string
    
    /** 
     * Handle the command
    */
    abstract handle () : boolean;
    
    static canHandle (command : string) : boolean {
        return command.trim().toUpperCase() === this.command;
    }
}


export = Command