import Command = require("./Command");
import HelpCommand = require("./HelpCommand");

export {Command, HelpCommand} 

export interface CommandPayload {
    command : string,
    sender? : string
}

/**
 * CommandFactory
 * Factory class that creates corresponding Command object with the help of CommandPayload
 */
export class CommandFactory {
    static commandFor(payload: CommandPayload): Command {
        
        if(HelpCommand.canHandle(payload.command)) {
            return new HelpCommand();
        }
        
        return null;
    }
}