///<reference path="typings/main.d.ts" />

import express = require("express");
var app = express();

var port = parseInt(process.env.PORT, 10) || 3000;
app.listen(port, ()=>{
    console.log("Started");
})

app.get('/health', (request, response)=>{
    response.end("Typescript Express Server")
} )
