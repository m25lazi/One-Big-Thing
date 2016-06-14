var request = require('request'); //TODO: JS??? Port to TypeScript!!!

/**
 * Request
 */
export = class Request {
    constructor() {
        
    }
    
    static get(url : string, queries : any, callback : (error : any, response : any, body : any) => void) {
        request({
            url : url,
            qs : queries,
            method : 'GET'
        }, function (error : any, response : any, body : any) {
            //response.statusCode
            callback (error, response, body)
        })
    }
    
}
