///<reference path="typings/main.d.ts" />
///<reference path="node_modules/retyped-firebase-tsd-ambient/firebase.d.ts" />
///<reference path="node_modules/retyped-body-parser-tsd-ambient/body-parser.d.ts" />
///<reference path="node_modules/retyped-request-tsd-ambient/request.d.ts" />


import express = require("express");
import bodyParser = require('body-parser');
import request = require('request');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let api_token = process.env.MESSENGER_API_TOKEN
let token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
//Set process.env.FIREBASE_URL also

/* Custom Modules */
import Commands = require("./Modules/Commands/CommandFactory")
import Item = require("./Modules/Models/Item")


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
    var messaging_events = req.body.entry[0].messaging;
    if(messaging_events){
        for (var i = 0; i < messaging_events.length; i++) {
            var event = req.body.entry[0].messaging[i];
            var sender = event.sender.id;
            if (event.message && event.message.text) {
                var text = event.message.text;
                
                
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
                    }, function (error, response, body) {
                        /* ERROR HANDLING */
                    });
                })
                
                
                
            }
            else if(event.postback && event.postback.payload){
                
            }
        }
    }
    else{
        console.log("NO MSG EVENTS")
    }
  
  res.sendStatus(200);
});



app.get('/health', (request, response)=>{
    response.end("Typescript Express Server : "+new Date().toString())
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

function handle(text:string, user:string, callback:(reply:string)=>void) {
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
            callback(JSON.stringify(cmdResponse))
        })
        
    }
    else{
        callback(null)
    }
}