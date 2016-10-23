import Messenger = require("./Models/Messenger")

/**
 * Onboarding
 * Takes care of helping users know about the product while they start use for the first time.
 */
class Onboarding{
    static container: {[user: string]: OnboardingContext} = {}

    /* Start onboarding for the user with Page-Scoped-ID 'psid' and name 'user' */
    static start(psid: string, user: string): Messenger.Response{
        let context = new OnboardingContext(psid, user);
        this.container[psid] = context;

        let yesQR = Messenger.Helper.CreateQuickReply("Yea!", "ONBOARDING_START_TUTORIALS")
        let noQR = Messenger.Helper.CreateQuickReply("Nah, later", "ONBOARDING_IGNORE_TUTORIALS")

        let message = "Hi " + user + "! Happy to see you here :)\nI am yet another task manager for you. But, what makes me different is that I will let you concentrate on a single BIG task everyday. Continue looking how to use me?";
        return Messenger.Helper.CreateResponse(message, [yesQR, noQR]);
    }

    static handle(psid: string, quickReplyPayload: string, text: string): Messenger.Response{
        let context = this.container[psid]
        
        let response: Messenger.Response = null;
        if(context){
            if(quickReplyPayload){
                switch (quickReplyPayload) {
                    case "ONBOARDING_IGNORE_TUTORIALS":
                        response = this.handleIgnoreTutorials(psid)
                        break;
                    case "ONBOARDING_START_TUTORIALS":
                        response = this.handleStartTutorials(psid)
                        break;
                    case "ONBOARDING_START_TUTORIALS":
                        response = this.handleStartTutorials(psid)
                        break;
                    case "ONBOARDING_STOP":
                        response = this.handleStop(psid)
                        break;
                
                    default:
                        console.log("Unknown onboarding Quick Reply");
                        //TODO: ???
                        break;
                }
            }
            else{
                switch (context.nextStep) {
                    case NextStep.CreateTask:
                        response = this.handleCreateTask(psid, text);
                        break;
                    case NextStep.CheckToday:
                        response = this.handleCheckTodaysTask(psid, text);
                        break;
                    case NextStep.MarkDone:
                        response = this.handleMarkDone(psid, text);
                        break;
                
                    default:
                        console.log("Unknown onboarding nextStep : "+ context.nextStep);
                        //TODO: ???
                        break;
                }
            }
        }

        return response;
    }

    private static handleIgnoreTutorials(psid: string): Messenger.Response{
        this.container[psid] = null

        let okQR = Messenger.Helper.CreateQuickReply("OK", "ONBOARDING_STOP")
        let message = "Fine :) One note - I am not you fully loaded personal assistant, whom you can ask 'Who is the President of USA?', but for task handling only";
        return Messenger.Helper.CreateResponse(message, [okQR]);
    }

    private static handleStop(psid: string): Messenger.Response{
        this.container[psid] = null

        let message = ":)";
        return Messenger.Helper.CreateResponse(message, null);
    }

    private static handleStartTutorials(psid: string): Messenger.Response{
        this.container[psid] = null;
        
        let message = "Let's get started. Everyday, you can create a task, that one important task for the day. I am powered by machine learning and you can ask me to create, update or mark your tasks done. Go ahead!";
        return Messenger.Helper.CreateResponse(message, null);
    }

    private static handleCreateTask(psid: string, text: string): Messenger.Response {
        if (text.trim().charAt(0) === '/') {
            var cmnd = text.trim().split(" ")[0]
            if (cmnd.trim().toUpperCase() === '/CREATE') {
                var item = text.trim().split(cmnd).join("").trim()
                if (item && item !== "") {
                    let context: OnboardingContext = this.container[psid]
                    context.createItem(item);
                    context.nextStep = NextStep.CheckToday;
                    this.container[psid] = context;

                    let message = "Awesome! You have created a test task. Don't worry, I will save this task and allow you to create new once onboarding is over.\nLet's find how to check today's task. Type /today";
                    return Messenger.Helper.CreateResponse(message, null);
                }
                else {
                    let message = "You should specify the task along with the command. Like '/create Meet Roy at CCD'. Try again.";
                    return Messenger.Helper.CreateResponse(message, null);
                }
            }
            else {
                let message = "Its /create. Try again.";
                return Messenger.Helper.CreateResponse(message, null);
            }
        }
        else {
            let message = "Start commands with '/'. Like '/create Join the club'. Try again.";
            return Messenger.Helper.CreateResponse(message, null);
        }
    }

    private static handleCheckTodaysTask(psid: string, text: string): Messenger.Response {
        if (text.trim().charAt(0) === '/') {
            var cmnd = text.trim().split(" ")[0]
            if (cmnd.trim().toUpperCase() === '/TODAY') {
                var item = text.trim().split(cmnd).join("").trim()
                if (item && item !== "") {
                    let message = "Oopz :|! No need to append anything with /today. Try again please";
                    return Messenger.Helper.CreateResponse(message, null);
                }
                else {
                    let context: OnboardingContext = this.container[psid]
                    context.markDone()
                    context.nextStep = NextStep.MarkDone;
                    this.container[psid] = context;
                    let message = "Your today's task : " + context.item + "\nCool B). What about marking the task as done? Type /done.";
                    return Messenger.Helper.CreateResponse(message, null);
                }
            }
            else {
                let message = "Its /today. Try again.";
                return Messenger.Helper.CreateResponse(message, null);
            }
        }
        else {
            let message = "You forgot / again. Its ok. Try again :)";
            return Messenger.Helper.CreateResponse(message, null);
        }
    }

    private static handleMarkDone(psid: string, text: string): Messenger.Response {
        if (text.trim().charAt(0) === '/') {
            var cmnd = text.trim().split(" ")[0]
            if (cmnd.trim().toUpperCase() === '/DONE') {
                var item = text.trim().split(cmnd).join("").trim()
                if (item && item !== "") {
                    let message = "Nah! No need to append anything with /done. Try again please"
                    return Messenger.Helper.CreateResponse(message, null);
                }
                else {
                    this.container[psid] = null;

                    let helpQR = Messenger.Helper.CreateQuickReply("/help", "ONBOARDING_STOPPED_HELP")
                    let message = "Super awesome ^_^.Thats enough for getting started. Use /help to get list of commands to try out. All the best! Be super organised";
                    return Messenger.Helper.CreateResponse(message, [helpQR]);
                }
            }
            else {
                let message = "Its /done. Try again."
                return Messenger.Helper.CreateResponse(message, null);
            }
        }
        else {
            let message = "You forgot / again. Its ok. Try again :)";
            return Messenger.Helper.CreateResponse(message, null);
        }
    }
}

enum NextStep {
    StartTutorials,
    CreateTask,
    CheckToday,
    MarkDone,
    Completed
}


/**
 * OnboardingContext
 * Holds the current context of the user onboarding session
 */
class OnboardingContext{
    nextStep: NextStep;
    item: string;
    done: boolean;
    constructor(public psid: string, public user: string){
        this.nextStep = NextStep.StartTutorials;
        this.item = null;
        this.done = false;
    }

    createItem (item : string){
        this.item = item;
    }

    markDone (){
        this.done = true;
    }

}

export = Onboarding;