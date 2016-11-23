import Request = require("../Request/Request")
import Database = require("../Database/Database")
import Config = require("../../Config/Config")

enum Provider {
    Unknown,
    FBMessenger
}

enum Gender {
    Unknown,
    Male,
    Female
}

/**
 * User
 * Represents each registered user
 */
export = class User {
    
    name : string // First name
    timezone : number 
    avatarUrl : String
    gender : Gender
    
    constructor(public id : string, public provider : Provider = Provider.FBMessenger) {
        this.gender = Gender.Unknown
    }

    /**
     * initWithGraphData
     * Initialize the User object with id and the data from FB Graph API
     */
    static initWithGraphData (id : string, data : any) : User {
        let user = new User(id)
        user.name = data["first_name"]
        user.avatarUrl = data["profile_pic"]
        user.timezone = data["timezone"]
        if (data["gender"] === "male") {
            user.gender = Gender.Male
        }
        else if (data["gender"] === "female") {
            user.gender = Gender.Female
        }
        return user
    }

    /**
     * init 
     * Initialize the User object with id and a data dictionary, probably from DB
     */
    static init (id : string, data : any) : User {
        let user = new User(id)
        user.avatarUrl = data.avatarUrl
        user.provider = data.provider
        user.name = data.name
        user.gender = data.gender
        user.timezone = data.timezone
        return user
    }
    
    /**
     * fetch 
     * Fetch user data from DB or from FB Graph API
     * First pref for DB, if its new user fetch from Graph API
     */
    static fetch(id : string, callback : (success : boolean, user : User) => void){
        User.fetchFromDB(id, (success, user)=> {
            if(success){
                if (user) {
                    console.log("User details fetched from DB")
                    callback(true, user)
                }
                else{
                    console.log("New User!! saveUsingGraphAPI")
                    User.saveUsingGraphAPI(id, (success, userFromGraphApi)=>{
                        if (success) {
                            console.log("New User details fetched!")
                            callback(true, userFromGraphApi)
                        }
                        else{
                            console.log("New User details fetch FAILED!")
                            callback(false, null)
                        }
                    })
                }
            }
            else{
                console.log("Some error in fetching from DB")
                callback(false, null)
            }
        })
    }

    /**
     * getAllUsers 
     * Fetches all user's id from DB
     * TODO : Need some other technique!!! This fetches whole user data, and take ids, which is too expensive!
     */
    static getAllUsers (callback : (success: boolean, userids: Array<string>) => void){
        Database.sharedDatabase().getAll("users", (data, error)=> {
            if(error) {
                callback(false, null)
            }
            else {
                if(data) {
                    let keys = Object.keys(data)
                    let userids: Array<string> = [];
                    keys.forEach(function (key: string) {
                        let fetched = data[key]
                        userids.push(fetched.id);
                    })
                    callback(true, userids)
                }
                else{
                    callback(true, null)
                }

            }
        })
    }

    private static fetchFromDB (id : string, callback : (success : boolean, user : User) => void){
        Database.sharedDatabase().findEqual("users", "id", id, (data, error) => {

            if(error) {
                callback(false, null)
            }
            else {
                if(data) {
                    let keys = Object.keys(data)
                    if (keys.length == 1) {
                        let key = keys[0]
                        let fetched = data[key]
                        let user = User.init(id, fetched)
                        callback(true, user)
                    }
                    else {
                        callback(false, null)
                    }
                }
                else{
                    callback(true, null)
                }

            }
        })
    }
    
    private static saveUsingGraphAPI (id : string, callback : (success : boolean, user : User) => void){
        Request.get("https://graph.facebook.com/v2.6/"+id, {
        fields : "first_name,last_name,profile_pic,locale,timezone,gender",
        access_token : Config.MessengerPageAccessToken
    }, (error, response, body)=>{
        if(error){
            console.log("Error fetching User - "+JSON.stringify(error));
            callback(false, null)
        }
        else if (response && response.statusCode!==200){
            console.log("Error fetching User - Status code : "+ response.statusCode)
            callback(false, null)
        }
        else if (body){
            let data = JSON.parse(body)
            let user = User.initWithGraphData(id, data)
            Database.sharedDatabase().push("users", user)
            callback(true, user)
        }
        else {
            throw "Unexpected Response from Graph API User Profile API"
        }
    })
    }
    
}