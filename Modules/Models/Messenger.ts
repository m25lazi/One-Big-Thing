var request = require('request'); //TODO: JS??? Port to TypeScript!!!

/**
 * Interface for Messenger Response.
 */
export interface Response{
    text?: string,
    quick_replies?: Array<QuickReply>
    attachment?: Attachment
    //TODO: Other types
}

/**
 * 
 */
export interface Attachment{
    type: string,
    payload: Payload
}

export class TemplateAttachment implements Attachment{
    type: string = "template"
    constructor(public payload: Payload){
    } 
}

export interface Payload{
    template_type: string,
    elements: Array<PayloadElement>
}

export class GenericPayload implements Payload{
    template_type: string = "generic"
    constructor(public elements: Array<PayloadElement>){
    } 
}

export interface PayloadElement{
    title: string,
    image_url?: string,
    subtitle?: string,
    buttons: Array<Button>
}

export interface Button{
    type: string,
    title: string
    url?: string,
    payload?: string
}

export class URLButton implements Button{
    type: string = "web_url"
    
    constructor(public title: string, public url: string){

    }
}

export class PostbackButton implements Button{
    type: string = "postback"
    constructor(public title: string, public payload: string){

    }
}

export class PhoneNumberButton implements Button{
    type: string = "phone_number"
    constructor(public title: string, public payload: string){

    }
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


export interface GenericTemplateMessage{
}


export class GenericAttachmentElement{
    constructor (public title: string, public image_url: string, public subtitle: string, public buttons: Array<Button>){
    }
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
    static send(recipient: string, message: any){
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
        },
            function (error: any, response: any, body: any) {
                if (error) {
                    return console.error('upload failed:', error);
                    //TODO:Error Handling???
                }
                console.log('Upload successful!  Server responded with:', body);
            });
    }

    static PayloadElement(title: string, image_url: string, subtitle: string, buttons: Array<Button>): PayloadElement{
        if (title && buttons) {
            return {
                title: title,
                image_url: image_url,
                subtitle: subtitle,
                buttons: buttons
            }
        }
        return null;
        
    }
}

