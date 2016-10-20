var apiai = require('apiai');
let clientToken = process.env.APIAI_CLIENT_TOKEN
let nluApp = apiai(clientToken);

class NLUHandler {
    static textRequest(message: string, callback: (reply: string, action: string) => void ) {
        console.log("Sending request")
        var request = nluApp.textRequest(message);

        request.on('response', function (response: any) {
            console.log(response);
            if(response){
                var result = response.result
                if(result){
                    var source = result.source
                    var domain = result.action
                    var fulfillment = result.fulfillment
                    if(source === "domains"){
                        if(domain === "smalltalk.greetings") {
                            if(fulfillment && fulfillment.speech) {
                                return callback(fulfillment.speech, null)
                            }
                        }
                    }
                    else if(source === "agent"){
                        if(domain === "items.get") {
                            return callback(null, "get")
                        }
                        else if(domain === "items.save") {
                            return callback(null, "save")
                        }
                        else if(domain === "items.done") {
                            return callback(null, "done")
                        }
                        else if(domain === "items.update") {
                            return callback(null, "update")
                        }
                        else if(domain === "items.streak") {
                            return callback(null, "streak")
                        }
                    }
                }
            }
            return callback(null, null)
        });

        request.on('error', function (error: any) {
            console.log(error);
            callback(null, null)
        });

        request.end();
    }
}

export = NLUHandler