import Command = require("./Command");
import Help = require("./HelpCommand");
import About = require("./AboutCommand");

export {Command, Help, About} 

export interface CommandPayload {
    command : string,
    message? : string,
    sender? : string
}

export interface CommandResponse {
    message : string,
    buttons? : [string]
}

/**
 * CommandFactory
 * Factory class that creates corresponding Command object with the help of CommandPayload
 */
export class CommandFactory {
    static commandFor(payload: CommandPayload): Command {
        
        if(Help.canHandle(payload.command)) {
            return new Help(payload);
        }
        else if(About.canHandle(payload.command)) {
            return new About(payload);
        }
        
        return null;
    }
}