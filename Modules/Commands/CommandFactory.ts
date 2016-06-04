import Command = require("./Command");
import Help = require("./HelpCommand");
import About = require("./AboutCommand");
import Create = require("./CreateCommand");
import Today = require("./TodayCommand");
import Update = require("./UpdateCommand");
import Done = require("./DoneCommand");
import Streak = require("./StreakCommand");


export {Command, Help, About, Create, Today, Update, Done, Streak} 

export interface CommandPayload {
    command : string,
    message? : string,
    sender? : string
}

export interface CommandHandler {
    (response : CommandResponse) : void
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
        else if(Create.canHandle(payload.command)) {
            return new Create(payload);
        }
        else if(Today.canHandle(payload.command)) {
            return new Today(payload);
        }
        else if(Update.canHandle(payload.command)) {
            return new Update(payload);
        }
        else if(Done.canHandle(payload.command)) {
            return new Done(payload);
        }
        else if(Streak.canHandle(payload.command)) {
            return new Streak(payload);
        }
        
        return null;
    }
}