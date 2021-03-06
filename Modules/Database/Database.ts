import Firebase = require("firebase");
import Config = require("../../Config/Config")

interface DatabaseHandler {
    (data : any, error : any) : void
}


class Database {
    constructor (private db : Firebase) {
        
    }
    public push (node : string, data : any) : string {
        return this.db.ref().child(node).push(data).key()
    }
    
    public update (node : string, data : any) {
        this.db.ref().child(node).update(data)
    }
    
    public findEqual (node : string, orderByChild: string, equalTo : string, callback : DatabaseHandler) {
        this.db.ref().child(node).orderByChild(orderByChild).equalTo(equalTo).once('value', (snapshot)=>{
            callback(snapshot.val(), null)
        })
    }
    
    public findStartAt (node : string, orderByChild: string, value : string, callback : DatabaseHandler){
        this.db.ref().child(node).orderByChild(orderByChild).startAt(value).once('value', (snapshot)=>{
            callback(snapshot.val(), null)
        })
    }

    public getAll (node: string, callback: DatabaseHandler){
        this.db.ref().child(node).once('value', (snapshot)=>{
            callback(snapshot.val(), null)
        })
    }
    
    static sharedDatabase () {
        var firebaseURL : string = Config.FirebaseBaseURL
        if(!firebaseURL || firebaseURL.trim() === "")
            throw "SET FIREBASE URL"
        return  new Database(new Firebase(firebaseURL));
    }
}

export = Database