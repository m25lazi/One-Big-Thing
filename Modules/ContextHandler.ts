import Messenger = require("./Models/Messenger")
// WARNING: Tightly coupled to messenger!!!
// TODO: Remove Messenger dependancy

import Commands = require("./Commands/CommandFactory")

interface ContextCompletionHandler {
    (response : Messenger.Response) : void
}

/**
 * ContextHandler
 * Handles current contexts of the user. Each context is valid for a particular amount of time and gets invalidated after that.
 */
class ContextHandler{
    
    private static container: {[user:string]: Context} = {}

    static createFromTextMessage(user:string){

    }

    static createFromPostback(user:string, command:string, sourceDescription:string, callback:ContextCompletionHandler){
        let contextType = ContextType.Unknown
        let response:Messenger.Response = null;
        if(command === "update"){
            contextType = ContextType.TaskUpdateTitle
            response = { text: "Title for the new task? (Eg: Complete PPT for demo)" }
        }
        else if(command === "create"){
            contextType = ContextType.TaskCreateTitle
            response = { text: "Title for the new task? (Eg: Start learning Probability)" }
        }
        
        if(contextType !== ContextType.Unknown){
            let context = new Context(contextType, Source.Postback, sourceDescription);
            this.container[user] = context;
        }

        if(callback)
            callback(response)
    }

    static handleTextMessage(user:string, text:string, callback:ContextCompletionHandler){
        let context = this.container[user]
        
        if(context){
            if(context.isValid()){
                switch (context.type) {
                    case ContextType.TaskUpdateTitle:
                        this.handleTaskUpdateTitle(user, context, text, callback);
                        break;
                    
                    case ContextType.TaskUpdateConfirmation:
                        this.handleTaskUpdateConfirmation(user, context, text, callback);
                        break;
                    
                    case ContextType.TaskCreateTitle:
                        this.handleTaskCreateTitle(user, context, text, callback);
                        break;

                    default:
                        callback(null)
                        break;
                }
                return
            }
        }

        return callback(null)
    }

    static handleQuickReply(user:string, payload:string, callback:ContextCompletionHandler){
        let context = this.container[user]
        
        if(context){
            if(context.isValid()){
                switch (context.type) {
                    case ContextType.TaskUpdateConfirmation:
                        this.handleTaskUpdateConfirmationQuickReply(user, context, payload, callback);
                        break;

                    default:
                        callback(null)
                        break;
                }
                return
            }
        }
        return callback(null)
    }


    private static handleTaskUpdateTitle(user:string, context:Context, text:string, callback:ContextCompletionHandler){
        context.info = text
        context.updateType(ContextType.TaskUpdateConfirmation)
        this.container[user] = context

        const yesQR = Messenger.Helper.CreateQuickReply("Yeah!", JSON.stringify({context:"confirmation.update", button:true}))
        const noQR = Messenger.Helper.CreateQuickReply("Nah", JSON.stringify({context:"confirmation.update", button:false}))

        if(callback)
            callback({
                text: "Are you sure, updating today's task to \"" + text + "\". Use reply suggestions or text back Y or N",
                quick_replies: [yesQR, noQR]
            })
    }

    private static handleTaskUpdateConfirmation(user:string, context:Context, text:string, callback:ContextCompletionHandler){

        const txt = text.toUpperCase()
        if(txt==="Y"){
            if (!context.info) {
                this.container[user] = context

                if (callback)
                    callback({ text: "FATAL ERROR" })
                return
            }

            var command = new Commands.Update({ command: "/update", sender: user, message: context.info })
            command.handle((cmdResponse) => {
                this.container[user] = null
                callback(createUpdateItemResponse(cmdResponse.error))
            })
        }
        else if(txt==="N"){
            this.container[user] = null
            if (callback)
                callback({ text: "Cool. Type /help for a list of commands." })
            return
        }
        else{
            if (callback)
                callback({ text: "Didn't get that! :( Please reply Y or N to confirm updation." })
            return
        }
    }

    private static handleTaskUpdateConfirmationQuickReply(user:string, context:Context, payload:string, callback:ContextCompletionHandler){
        var jsonPayload:any = null
        try {
            jsonPayload =  JSON.parse(payload);
        }
        catch (e){
            this.container[user] = null
            if(callback)
            	callback(null)
            return
        }
        finally{
            if(jsonPayload.context !== "confirmation.update"){
                this.container[user] = null
                if (callback)
                    callback(null)
                return
            }
            
            if(jsonPayload.button === true){
                if(!context.info){
                    this.container[user] = context

                    if(callback)
                        callback ({text: "FATAL ERROR"})
                    return 
                }

                var command = new Commands.Update({ command : "/update", sender : user, message : context.info })
                command.handle((cmdResponse) => {
                    this.container[user] = null
                    callback(createUpdateItemResponse(cmdResponse.error))
                })

            }
            else{
                this.container[user] = null
                if(callback)
                    callback ({ text: "Cool. Type /help for a list of commands." })
                return
            }
        }
        
    }

    private static handleTaskCreateTitle(user:string, context:Context, text:string, callback:ContextCompletionHandler){
        var command = new Commands.Create({ command: "/create", sender: user, message: text})
        command.handle((cmdResponse) => {
            this.container[user] = null
            callback(createAddItemResponse(cmdResponse.error))
        })
        
    }

}

enum ContextType {
    Unknown,
    TaskUpdateTitle,
    TaskUpdateConfirmation,
    TaskCreateTitle
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

/* Todo: Remove this!!! This is a copy of createUpdateItemResponse, createAddItemResponse from Index */

import Error = require("./Error");
function createUpdateItemResponse(error: number): any{
    let message = ""
    if(error===0)
        message = "Updated!!!"
        /* Better show Attachment like in Today view */
    else
        message = Error.description[error]
    
    return { text: message }
}

function createAddItemResponse(error: number): any{
    let message = ""
    if(error===0)
        message = "Created :)"
        /* Better show Attachment like in Today view */
    else
        message = Error.description[error]
    
    return { text: message }
}


export = ContextHandler