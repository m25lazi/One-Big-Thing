///<reference path="typings/main.d.ts" />
///<reference path="node_modules/retyped-firebase-tsd-ambient/firebase.d.ts" />
///<reference path="node_modules/retyped-body-parser-tsd-ambient/body-parser.d.ts" />
/////<reference path="node_modules/retyped-request-tsd-ambient/request.d.ts" />


import express = require("express");
import bodyParser = require('body-parser');
// import request = require('request');
var request = require('request'); //TODO: JS??? Port to TypeScript!!!

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let api_token = process.env.MESSENGER_API_TOKEN
let token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
//Set process.env.FIREBASE_URL also

/* Custom Modules */
import Commands = require("./Modules/Commands/CommandFactory")
import Item = require("./Modules/Models/Item")
import User = require("./Modules/Models/User")
import Onboarding = require("./Modules/Onboarding")
import ContextHandler = require("./Modules/ContextHandler")
import Messenger = require("./Modules/Models/Messenger")


/* Start app */
var port = parseInt(process.env.PORT, 10) || 8080;
app.listen(port, ()=>{
    console.log("Started on "+port);
})


app.get('/webhook/', (req, res) => {
    console.log('GET /webhook');
    console.log(req)
    if (req.query['hub.verify_token'] === api_token) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
})

let handledMessages : any = {} 
app.post('/webhook/', function (req, res) {
    console.log('POST /webhook');
    console.log(JSON.stringify(req.body.entry))
    res.sendStatus(200);
    /**
     * TODO : take care about the mid - req.body.entry[0].messaging[0].mid
     * Issue : while server is in idle state, we are getting message 2 times. Two actions are carried out for the same request!!!
     * [{"id":"564364760261430","time":1465022418376,"messaging":[{"sender":{"id":"835579686547079"},"recipient":{"id":"564364760261430"},"timestamp":1465022403753,"message":{"mid":"mid.1465022403746:63d1e44a541ba7c892","seq":469,"text":"/about"}}]}]
     */
    var messaging_events = req.body.entry[0].messaging;
    if(messaging_events){
        for (var i = 0; i < messaging_events.length; i++) {
            var event = req.body.entry[0].messaging[i];
            var sender = event.sender.id;
            if (event.message && event.message.text) {
                var messageId = event.message.mid;
                if(handledMessages[messageId] === true){
                    console.log("Message already handled");
                    return;
                }

                handledMessages[messageId] = true;
                var text = event.message.text;
                var quickReplyPayload : string = null;
                if(event["message"]["quick_reply"] && event["message"]["quick_reply"]["payload"])
                    quickReplyPayload = event["message"]["quick_reply"]["payload"]
                
                /*
                    Fetch user details async'ly. Not using any data, so just save ot for future ref 
                */
                User.fetch(sender, (success, user)=>{
                    
                })
                
                var response: Messenger.Response = Onboarding.handle(sender, quickReplyPayload, text);
                if(response)
                    return Messenger.Helper.send(sender, response);
                
                if (quickReplyPayload) {
                    response = ContextHandler.handleQuickReply(sender, quickReplyPayload)
                    if (response)
                        return Messenger.Helper.send(sender, response);
                }

                response = ContextHandler.handleTextMessage(sender, text)
                if (response)
                    return Messenger.Helper.send(sender, response);

                handle(text, sender, (reply) => {
                    return sendMessage(sender, reply)
                })
                
                
            }
            else if(event.postback && event.postback.payload){
                if(event.postback.payload === "MESSENGER_NEW_THREAD"){
                    /* New User! Hurray!!! Lets welcome him/her! */
                    User.fetch(sender, (success, user)=>{
                        const response: Messenger.Response = Onboarding.start(sender, user.name);
                        Messenger.Helper.send(sender, response);
                    })

                }
                else{
                    try {
                        const jsonPayload =  JSON.parse(event.postback.payload);
                        if (jsonPayload.context) {
                            if(jsonPayload.context === "today"){
                                if(jsonPayload.button === "done"){
                                    var command = new Commands.Done({command:"/done", sender: sender})
                                    command.handle((cmdResponse) => {
                                        const reply = cmdResponse.message
                                        if (reply) {
                                            return sendMessage(sender, { text: reply })
                                        }
                                        
                                    }) 
                                }
                                else if(jsonPayload.button === "update"){
                                    const response = ContextHandler.createFromPostback(sender, jsonPayload.button, "attachment.today")
                                    if(response){
                                        return sendMessage(sender, response)
                                    }
                                    return sendMessage(sender, { text: "FATAL ERROR" })
                                }
                                else if(jsonPayload.button === "ok"){
                                    //Nothing to do! Keep Calm and return
                                    return
                                }
                            }
                        }
                    }
                    catch (e) {
                        console.log("Unknown postback : "+ event.postback.payload)
                    }
                    
                }
            }
        }
    }
    else{
        console.log("NO MSG EVENTS")
    }
});



app.get('/health', (request, response)=>{
    let gmtDate = Math.round(new Date().getTime())
    let istDate = gmtDate + ((5*60+30)*60*1000)
        
    let date = new Date (istDate)
    response.end("Typescript Express Server : "+date.toString())
})

app.post('/message', (request, response)=>{
    console.log("=============== NEW REQUEST ==================");
    console.log(request.body);
    
    let text : string = request.body.text;
    let sender : string = request.body.sender;
    if(text.trim().charAt(0) === '/'){
        console.log("Commaaaaand!!!!")
        User.fetch(sender, (success, user)=>{
        })
        var cmnd = text.trim().split(" ")[0]
        console.log(cmnd);
        
        var cmd : Commands.Command = Commands.CommandFactory.commandFor({command : cmnd, message : text.trim().split(cmnd).join("").trim(), sender : sender})
        console.log(cmd)
        cmd.handle( (cmdResponse) => {
            console.log(cmdResponse)
            response.header("Content-Type", "application/json")
            response.end(JSON.stringify(cmdResponse))
        })
        
    }
    else{
        response.header("Content-Type", "application/json")
        response.end(JSON.stringify(request.body))
    }
    
    
    
    
})

function handle(text:string, sender:string, callback:(reply:any)=>void) {
    if(text.trim().charAt(0) === '/'){
        console.log("Commaaaaand!!!!")
        var cmnd = text.trim().split(" ")[0]
        console.log(cmnd);
        
        var cmd : Commands.Command = Commands.CommandFactory.commandFor({command : cmnd, message : text.trim().split(cmnd).join("").trim(), sender : sender})
        console.log(cmd)
        if(!cmd){
            callback(null)
            return
        }
        cmd.handle( (cmdResponse) => {
            const reply = cmdResponse.message
            if(Commands.Today.canHandle(cmnd)){
                return callback(createTodayResponse(cmdResponse.item, cmdResponse.errorDescription))
            }
            else{
                if (reply) {
                    return callback({ text: reply })
                }
            }
            return callback({ text: "Unknown command. Use /help for more info." })
        })
        
    }
    else{
        callback({ text: "Unknown command. Use /help for more info." })
    }
}

function sendMessage(recipient: string, messageData: any) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: token },
        method: 'POST',
        json: {
            recipient: { id: recipient },
            message: messageData,
        }
    });//TODO:Error Handling???
}


function createTodayResponse(item: Item, errorMessage: string):any {
    if(errorMessage){
        return {text : errorMessage}
    }
    else if(item){
        let title = item.text
        let element:Messenger.PayloadElement = null
        if (item.done){
            title = title + " (Done)"
            const okPostbackPayload = {context:"today", button:"ok", created:new Date()}
            const ok = new Messenger.PostbackButton("OK", JSON.stringify(okPostbackPayload))
            element = Messenger.Helper.PayloadElement(title, null, dateFormatter(item.date), [ok])
        }
        else{
            const done = new Messenger.PostbackButton("Mark Done", JSON.stringify({context:"today", button:"done", user: item.user, date:item.date, created:new Date()}))
            console.log(JSON.stringify({context:"today", button:"done", user: item.user, date:item.date, created:new Date()}))
            //"{\"context\":\"today\",\"button\":\"done\",\"user\":\"835579686547079\",\"date\":\"20160729\",\"created\":\"2016-07-29T16:04:49.494Z\"}"

            const update = new Messenger.PostbackButton("Update", JSON.stringify({context:"today", button:"update", user: item.user, date:item.date, created:new Date()}))
            console.log(JSON.stringify({context:"today", button:"update", user: item.user, date:item.date, created:new Date()}));
            //{"context":"today","button":"update","user":"835579686547079","date":"20160729","created":"2016-07-29T16:04:49.494Z"}

            element = Messenger.Helper.PayloadElement(title, null, dateFormatter(item.date), [done])
        }

        const payl = new Messenger.GenericPayload([element])

        const attach = new Messenger.TemplateAttachment(payl)

        let message = {
            attachment: attach
        }
        return message
    }
    else{
        return {text : "FATAL ERROR"}
    }
    
}

var dateFormat = require('dateformat');
import Today = require("./Modules/Extensions/Today")
function dateFormatter(date:string):string {
    var now = Today.fromNumber(parseInt(date, 10)).toDate();
    return dateFormat(now, "dddd, mmmm dS")
}


/**
 * TODO: Get Profile
 * https://graph.facebook.com/v2.6/<USER_ID>?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=<PAGE_ACCESS_TOKEN>
 {
   "first_name": "Lazim",
   "last_name": "Mohammed",
   "profile_pic": "https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpt1/v/t1.0-1/p200x200/10606488_916735125009225_5475037962770384238_n.jpg?oh=67d84aa123abf7273709cabe76b352e1&oe=57D9FF72&__gda__=1477010447_c8fc8182c65a0f011322e3a34aa3c6f9",
   "locale": "en_IN",
   "timezone": 5.5,
   "gender": "male"
}
 */