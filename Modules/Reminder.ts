import Commands = require("./Commands/CommandFactory")
import Messenger = require("./Models/Messenger")

class Reminder {

    /* Currently hardcoded to my personal test ID */
    static remindableUsers = [process.env.TEST_ACCOUNT]

    constructor() { }

    private assignedTaskPresentFor(user: string, callback: (present: Boolean) => void) {
        new Commands.Today({ command: "/today", sender: user }).handle((commandResponse) => {
            if(commandResponse.item){
                callback(true)
            }
            else{
                callback(false)
            }
        })
    }

    public handle(){
        
        /* Get all Users who have not enabled DnD, hardcoded <remindableUsers> as of now */

        Reminder.remindableUsers.forEach(function(user){
            this.assignedTaskPresentFor(user, (present: Boolean)=>{
                if(present){
                    console.log("Task already present for user: "+user)
                }
                else{
                    Messenger.Helper.send(user, "Good morning, Lazim! Would you like to create today's task?")
                }
            })
        })

    }


}

export = Reminder