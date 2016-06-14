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
                var text = event.message.text;
                
                /*
                    Fetch user details async'ly. Not using any data, so just save ot for future ref 
                */
                User.fetch(sender, (success, user)=>{
                    
                })
                
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