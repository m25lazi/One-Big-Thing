import Command = require("./Command");
import Commands = require("./CommandFactory");
import Item = require("../Models/Item");

/**
 * StreakCommand
 * Handles /Streak
 */
class StreakCommand extends Command {
    
    static command = "/STREAK"
    
    constructor(commandPayload : Commands.CommandPayload) {
        super(commandPayload)
    }
    
    public handle (callback : Commands.CommandHandler){
        console.log("Handling /STREAK")
        const daysForStreak = 3
        
        Item.streak(this.payload.sender, daysForStreak, (success, streak) => {
            let message = "Starting from yday : "
            // Use these ️✅❌❗️💯
            let total = 0;
            streak.forEach(element => {
                if(element){
                    total++
                    message+= "✅"
                }
                else{
                    message+= "❌"
                }
            });
            if(total === daysForStreak){
                message +="\nGreat JOB 💯"
            }
            callback ({message : message})
        })
    }
}

export = StreakCommand