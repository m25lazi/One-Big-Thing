var request = require('request'); //TODO: JS??? Port to TypeScript!!!

/**
 * Interface for Messenger Response.
 */
export interface Response{
    text: string,
    quick_replies?: Array<QuickReply>
    //TODO: Other types
}

/**
 * Interface for Messenger Response QuickReply.
 * content_type must be "text"
 */
export interface QuickReply{
    content_type: string,
    title: string,
    payload: string
}

/**
 * Helper class for Messenger Responses.
 * content_type must be "text"
 */
export class Helper{
    /* Creates Quick reply object with title and payload */
    static CreateQuickReply(title: string, payload: string): QuickReply{
        return {
            content_type: "text",
            title: title,
            payload: payload
        }
    }

    /* Creates message object for using in messenger platform SEND API */
    static CreateResponse(text: string, quickReplies: Array<QuickReply>): Response{
        return {
            text: text,
            quick_replies: quickReplies
        }
    }

    /* Sends given response POSTing to messenger platform SEND API */
    static send(recipient: string, message: Response){
        console.log("sending");
        console.log(message);
        
        let token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
        request({
            url: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: token },
            method: 'POST',
            json: {
                recipient: { id: recipient },
                message: message,
            }
        });//TODO:Error Handling???
    }
}