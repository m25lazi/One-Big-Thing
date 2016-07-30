/**
 * ContextHandler
 * Handles current contexts of the user. Each context is valid for a particular amount of time and gets invalidated after that.
 */
class ContextHandler{
    private static container: {[user:string]: Context} = {}

    static create(user:string){
        
    }

    static handleTextMessage(user:string, text:string):boolean{
        return false;
    }

    static handleQuickReply(user:string, payload:string):boolean{
        return false;
    }

}

enum ContextType {
    WaitingTaskUpdateTitle,
    WaitingTaskUpdateConfirmation
}

/**
 *  Context
 */
class Context{
    static validity:number = 5*60 //5 min
    created:number
    expires:number
    constructor(public type:string) { }

}