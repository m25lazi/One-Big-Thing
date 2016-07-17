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
let onboarding : any = {}
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
                    var messageData = {
                        text: "DEBUG\nMessage already handled\n Current id : "+messageId+"\n handledMessages : "+JSON.stringify(handledMessages)
                    }
                    request({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: { access_token: token },
                        method: 'POST',
                        json: {
                            recipient: { id: sender },
                            message: messageData,
                        }
                    });
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
                if(onboarding[sender] && onboarding[sender]["started"] == true){
                    if(quickReplyPayload){
                        if(quickReplyPayload === "ONBOARDING_IGNORE_TUTORIALS"){
                            let messageData = {
                                "text": "Fine :) One note - You can invoke me using commands. Type /help anytime to get list of commands.",
                                "quick_replies": [
                                    {
                                        "content_type": "text",
                                        "title": "OK",               
                                        "payload": "ONBOARDING_STOP"
                                    }
                                ]
                            }
                            sendMessage(sender, messageData)
                            onboarding[sender]["context"] = "DONE"
                            return
                        }
                        else if(quickReplyPayload === "ONBOARDING_START_TUTORIALS"){
                            let messageData = {
                                "text": "Let's get started. Everyday, you can create a task, that one important task for the day. Use /create command for this. Example : '/create Complete watching Android animations basic course videos'. Give it a try"
                            }

                            sendMessage(sender, messageData)
                            onboarding[sender]["context"] = "WAITING_CREATE_TASK"
                            return
                        }
                        else if(quickReplyPayload ==="ONBOARDING_STOP"){
                            onboarding[sender] = null
                            return
                        }
                    }
                    else{
                        if(onboarding[sender]["context"] === "WAITING_CREATE_TASK"){
                            if (text.trim().charAt(0) === '/') {
                                var cmnd = text.trim().split(" ")[0]
                                if(cmnd.trim().toUpperCase() === '/CREATE'){
                                    var item = text.trim().split(cmnd).join("").trim()
                                    if(item && item !== ""){
                                        onboarding[sender]["item"] = item
                                        let messageData = {
                                            "text": "Awesome! You have created a test task. Don't worry, I will save this task and allow you to create new once onboarding is over.\n Let's find how to check today's task. Type /today"
                                        }
                                        sendMessage(sender, messageData)
                                        onboarding[sender]["context"] = "WAITING_TODAY_TASK_CREATED"
                                        return
                                    }
                                    else{
                                        let messageData = {
                                            "text": "You should specify the task along with the command. Like '/create Meet Roy at CCD'. Try again."
                                        }
                                        sendMessage(sender, messageData)
                                        onboarding[sender]["context"] = "WAITING_CREATE_TASK"
                                        return
                                    }
                                }
                            }
                            else{
                                let messageData = {
                                    "text": "Start commands with '/'. Like '/create Join the club'. Try again."
                                }
                                sendMessage(sender, messageData)
                                onboarding[sender]["context"] = "WAITING_CREATE_TASK"
                                return
                            }
                        }
                        else if(onboarding[sender]["context"] === "WAITING_TODAY_TASK_CREATED"){
                            if (text.trim().charAt(0) === '/') {
                                var cmnd = text.trim().split(" ")[0]
                                if(cmnd.trim().toUpperCase() === '/TODAY'){
                                    var item = text.trim().split(cmnd).join("").trim()
                                    if(item && item !== ""){
                                        onboarding[sender]["item"] = item
                                        let messageData = {
                                            "text": "Oopz 😐! No need to append anything with /today. Try again please🏻"
                                        }
                                        sendMessage(sender, messageData)
                                        onboarding[sender]["context"] = "WAITING_TODAY_TASK_CREATED"
                                        return
                                    }
                                    else{
                                        let messageData = {
                                            "text": "Your today's task:"+onboarding[sender]["item"]+"\nCool 😎. What about marking the task as done? Type /done."
                                        }
                                        sendMessage(sender, messageData)
                                        onboarding[sender]["context"] = "WAITING_MARKING_DONE"
                                        return
                                    }
                                }
                            }
                            else{
                                let messageData = {
                                    "text": "You forgot / again. Its ok. Try again 😊"
                                }
                                sendMessage(sender, messageData)
                                onboarding[sender]["context"] = "WAITING_TODAY_TASK_CREATED"
                                return
                            }
                        }
                        else if(onboarding[sender]["context"] === "WAITING_MARKING_DONE"){
                            if (text.trim().charAt(0) === '/') {
                                var cmnd = text.trim().split(" ")[0]
                                if(cmnd.trim().toUpperCase() === '/DONE'){
                                    var item = text.trim().split(cmnd).join("").trim()
                                    if(item && item !== ""){
                                        onboarding[sender]["item"] = item
                                        let messageData = {
                                            "text": "Nah! No need to append anything with /done. Try again please🏻"
                                        }
                                        sendMessage(sender, messageData)
                                        onboarding[sender]["context"] = "WAITING_MARKING_DONE"
                                        return
                                    }
                                    else{
                                        let messageData = {
                                            "text": "Super awesome 😍. Thats enough for getting started. Use /help to get list of commands to try out. All the best! Be super organised",
                                            "quick_replies": [
                                                {
                                                    "content_type": "text",
                                                    "title": "/help🏻",
                                                    "payload": "ONBOARDING_STOPPED_HELP"
                                                }
                                            ]
                                        }
                                        sendMessage(sender, messageData)
                                        onboarding[sender] = null
                                        return
                                    }
                                }
                            }
                            else{
                                let messageData = {
                                    "text": "You forgot / again. Its ok. Try again 😊"
                                }
                                sendMessage(sender, messageData)
                                onboarding[sender]["context"] = "WAITING_MARKING_DONE"
                                return
                            }
                        }
                    }
                    onboarding[sender] = null
                }
                
                handle(text, sender, (reply)=>{
                    var messageData : any = null
                    if(reply){
                        messageData = {
                            text : reply
                        }
                    }
                    else{
                        messageData = {
                            text : "Unknown command. Use /help for more info."
                        }
                    }
                    request({
                        url: 'https://graph.facebook.com/v2.6/me/messages',
                        qs: { access_token: token },
                        method: 'POST',
                        json: {
                            recipient: { id: sender },
                            message: messageData,
                        }
                    });//TODO:Error Handling???
                })
                
                
                
            }
            else if(event.postback && event.postback.payload){
                if(event.postback.payload === "MESSENGER_NEW_THREAD"){
                    /* New User! Hurray!!! Lets welcome him/her! */
                    User.fetch(sender, (success, user)=>{
                        onboarding[sender] = { started : true, context : "WAITING_TUTORIAL_RESPONSE" };
                        let messageData = {
                            "text" : "Hi " + user.name + "! Happy to see you here :)\nI am another task manager for you. But, what makes me different is that I will let you concentrate on a single BIG task everyday. Continue looking how to use me?",
                            "quick_replies" : [
                                {
                                    "content_type":"text",
                                    "title":"Yea!",
                                    "payload":"ONBOARDING_START_TUTORIALS"
                                },
                                {
                                    "content_type":"text",
                                    "title":"Nah, later",
                                    "payload":"ONBOARDING_IGNORE_TUTORIALS"
                                }
                            ]

                        }
                        sendMessage(sender, messageData)
                    })

                }
                else{
                    console.log("Unknown postback : "+ event.postback.payload)
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
            console.log(cmdResponse)
            callback(cmdResponse.message)
        })
        
    }
    else{
        callback(null)
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