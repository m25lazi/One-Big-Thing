/**
 * Item
 * Represents the review item posted by a user for a particular day.
 */

import Database = require("../Database/Database")

interface ItemHandler {
    (success : boolean, item : Item) : void
}

class Item {
    itemId : string;
    date : string; //YYYYMMDD format
    created : number;
    updated : number;
    private primary : string // now : user+date / change to date+user
    constructor (public user : string, public text : string) {
        
    }
    
    static add(user : string, text : string, callback :  ItemHandler) {
        var item = new Item(user, text)
        item.date = Item.getToday()
        if(item.canCreate()){
            item.created = Math.round(new Date().getTime()/1000)
            item.primary = item.user+item.date
            item.itemId = Database.sharedDatabase().push("items", item)
            return callback (true, item)
        }
        
        return callback (false, null)   
    }
    
    static fetch(user : string, day : number, callback :  ItemHandler) {
        var date =  parseInt(this.getToday(), 10)
        date +=day
        Database.sharedDatabase().findEqual("items", "primary", user+date, (data, error) => {
            if(error){
                throw "ERROR FROM DB"
            }
            else {
                if (data) {
                    let keys = Object.keys(data)
                    if (keys.length == 1) {
                        let key = keys[0]
                        let fetched = data[key]
                        var item = new Item(fetched.user, fetched.text)
                        item.date = fetched.date
                        item.created = fetched.created
                        item.updated = fetched.updated
                        item.itemId = key
                        callback(true, item)
                    }
                    else {
                        throw "ITEM findEqual RETURNS MORE THAN 1"
                    }
                }
                else{
                    callback(true, null)
                }
                
                
                
           
            }
        })
    }
    
    private canCreate() : boolean{
        /* Check whether any entry is there for today */
        return true;
    }
    
    private static getToday () : string {
        //TODO: Timezone???
        let date = new Date ()
        
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        var dateOfMonth = date.getDate().toString();
        return year + (month[1] ? month : "0" + month[0]) + (dateOfMonth[1] ? dateOfMonth : "0" + dateOfMonth[0]); 
    }
    
}

export = Item