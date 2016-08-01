import Messenger = require("./Models/Messenger")
// WARNING: Tightly coupled to messenger!!!
//TODO: Remove Messenger dependancy

import Commands = require("./Commands/CommandFactory")

/**
 * ContextHandler
 * Handles current contexts of the user. Each context is valid for a particular amount of time and gets invalidated after that.
 */
class ContextHandler{
    
    private static container: {[user:string]: Context} = {}

    static createFromTextMessage(user:string){

    }

    static createFromPostback(user:string, command:string, sourceDescription:string):Messenger.Response{
        let contextType = ContextType.Unknown
        let response:Messenger.Response = null;
        if(command === "update"){
            contextType = ContextType.TaskUpdateTitle
            response = { text: "Title for the new task? (Eg: Complete PPT for demo)" }
        }
        
        if(contextType !== ContextType.Unknown){
            let context = new Context(contextType, Source.Postback, sourceDescription);
            this.container[user] = context;
        }
        return response
    }

    static handleTextMessage(user:string, text:string):Messenger.Response{
        let context = this.container[user]
        console.log(context)
        let response:Messenger.Response = null;
        if(context){
            if(context.isValid()){
                switch (context.type) {
                    case ContextType.TaskUpdateTitle:
                        response = this.handleTaskUpdateTitle(user, context, text);
                        break;

                    default:
                        break;
                }
            }
        }
        return response;
    }

    static handleQuickReply(user:string, payload:string):Messenger.Response{
        let context = this.container[user]
        console.log(context)
        let response:Messenger.Response = null;
        if(context){
            if(context.isValid()){
                switch (context.type) {
                    case ContextType.TaskUpdateConfirmation:
                        response = this.handleTaskUpdateConfirmation(user, context, payload);
                        break;

                    default:
                        break;
                }
            }
        }
        return response;
    }


    private static handleTaskUpdateTitle(user:string, context:Context, text:string):Messenger.Response{
        context.info = text
        context.updateType(ContextType.TaskUpdateConfirmation)
        this.container[user] = context

        const yesQR = Messenger.Helper.CreateQuickReply("Yeah!", JSON.stringify({context:"confirmation.update", button:true}))
        const noQR = Messenger.Helper.CreateQuickReply("Nah", JSON.stringify({context:"confirmation.update", button:false}))

        return {
            text : "Are you sure, updating today's task to \""+text+"\"",
            quick_replies : [yesQR, noQR]
        }
    }

    private static handleTaskUpdateConfirmation(user:string, context:Context, payload:string):Messenger.Response{
        var jsonPayload:any = null
        try {
            jsonPayload =  JSON.parse(payload);
        }
        catch (e){
            this.container[user] = null
            return null
        }
        finally{
            if(jsonPayload.context !== "confirmation.update"){
                this.container[user] = null
                return null
            }
            
            if(jsonPayload.button === true){
                if(!context.info){
                    this.container[user] = context
                    return {
                        text: "FATAL ERROR",
                    }
                }

                var command = new Commands.Update({ command : "/update", sender : user, message : context.info })
                command.handle((cmdResponse) => {
                    this.container[user] = null
                    const reply = cmdResponse.message
                    if (reply) {
                        return Messenger.Helper.send(user, { text: reply })
                    }

                })

            }
            else{
                this.container[user] = null
                return {
                    text: "Cool. Type /help for a list of commands.",
                }
            }
        }
        
    }

}

enum ContextType {
    Unknown,
    TaskUpdateTitle,
    TaskUpdateConfirmation
}

enum Source{
    Postback,
    QuickReply,
    Text
}

/**
 *  Context
 */
class Context{
    /* Validity of the context */
    static validity:number = 2*60 //2 min

    created:number
    expires:number
    info:string

    constructor(public type:ContextType, public source:Source, public sourceDescription:string) {
        const currentEpoch = Math.round(new Date().getTime() / 1000)
        this.created = currentEpoch
        this.expires = currentEpoch + Context.validity
    }

    updateType(type:ContextType){
        const currentEpoch = Math.round(new Date().getTime() / 1000)
        this.expires = currentEpoch + Context.validity
        this.type = type
    }

    isValid():boolean{
        const currentEpoch = Math.round(new Date().getTime() / 1000)
        if(this.expires>currentEpoch)
            return true
        
        return false
    }

}

export = ContextHandler