import Messenger = require("./Models/Messenger")

/**
 * ContextHandler
 * Handles current contexts of the user. Each context is valid for a particular amount of time and gets invalidated after that.
 */
class ContextHandler{
    
    private static container: {[user:string]: Context} = {}

    static createFromTextMessage(user:string){

    }

    static createFromPostback(user:string, command:string, sourceDescription:string):boolean{
        let contextType = ContextType.Unknown
        if(command === "update")
            contextType = ContextType.TaskUpdateTitle
        
        if(contextType !== ContextType.Unknown){
            let context = new Context(contextType, Source.Postback, sourceDescription);
            this.container[user] = context;
            return true
        }
        return false
    }

    static handleTextMessage(user:string, text:string):boolean{
        let context = this.container[user]
        if(context){
            if(context.isValid()){
                switch (context.type) {
                    case ContextType.TaskUpdateTitle:
                        context.info = text
                        context.updateType(ContextType.TaskUpdateConfirmation)
                        //Ask for confirmation

                        break;

                    default:
                        break;
                }
            }
        }
        return false;
    }

    static handleQuickReply(user:string, payload:string):boolean{
        return false;
    }


    private handleTaskUpdateTitle:(user:string, text:string){

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
    }

    isValid():boolean{
        const currentEpoch = Math.round(new Date().getTime() / 1000)
        if(this.expires>currentEpoch)
            return true
        
        return false
    }

}

export = ContextHandler