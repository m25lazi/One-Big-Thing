import Commands = require("./Commands/CommandFactory")
import Messenger = require("./Models/Messenger")
import Context = require("./ContextHandler")

class Reminder {

    /* Currently hardcoded to my personal test ID */
    static remindableUsers = [String(process.env.TEST_ACCOUNT)]

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
        var reminder = this
        Reminder.remindableUsers.forEach(function(user){
            reminder.assignedTaskPresentFor(user, (present: Boolean)=>{
                if(present){
                    console.log("Task already present for user: "+user)
                }
                else{
                    console.log("Send Reminder")

                    const title = "Good morning! Would you like to create today's task?"

                    const createPostbackPayload = { context: "reminder", button: "create", created: new Date() }
                    const createButton = new Messenger.PostbackButton("Create", JSON.stringify(createPostbackPayload))

                    const laterPostbackPayload = { context: "reminder", button: "later", created: new Date() }
                    const laterButton = new Messenger.PostbackButton("May be later!", JSON.stringify(createPostbackPayload))

                    let element: Messenger.PayloadElement = Messenger.Helper.PayloadElement(title, null, null, [createButton, laterButton])
                    const payload = new Messenger.GenericPayload([element])
                    const attachment = new Messenger.TemplateAttachment(payload)

                    Messenger.Helper.send(user, { attachment: attachment })
                }
            })
        })

    }

    public static handlePostback(sender: string, payload: any){
        if (payload.button === "create") {
            Context.createFromPostback(sender, payload.button, "reminder.create", (response) => {
                if (response)
                    return Messenger.Helper.send(sender, response)

                Messenger.Helper.send(sender, Messenger.Helper.CreateResponse("FATAL ERROR 1", null))
            })

        }
        else if (payload.button === "later") {
            //Nothing to do! Just send an acknowledgement
            Messenger.Helper.send(sender, Messenger.Helper.CreateResponse("Cool ^_^", null))
        }
    }


}

export = Reminder