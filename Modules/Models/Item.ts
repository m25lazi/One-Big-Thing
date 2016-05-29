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
    done : boolean;
    private primary : string; 
    constructor (public user : string, public text : string) {
        
    }
    
    static add(user : string, text : string, callback :  ItemHandler) {
        
        this.fetch(user, 0, (success, item)=>{
            if(item){
                /* Already there! throw for now */
                throw "CREATE?? ALREADY THERE!"
            }
            else{
                var item = new Item(user, text)
                item.date = Item.getToday()
                if (item.canCreate()) {
                    item.created = Math.round(new Date().getTime() / 1000)
                    item.primary = item.date + item.user
                    item.done = false
                    item.itemId = Database.sharedDatabase().push("items", item)
                    return callback(true, item)
                }
            }
        })
    }
    
    static update(user : string, text : string, callback :  ItemHandler) {
        
        this.fetch(user, 0, (success, item)=>{
            if(!item){
                /* Create new one! But throw for now */
                throw "UPDATE BUT NOTHING THERE!"
            }
            else if (item.done){
                /* Already completed! */
                throw "TRYING TO UPDATE COMPLETED ITEM!"
            }
            else{
                item.text = text
                item.updated = Math.round(new Date().getTime()/1000)
                Database.sharedDatabase().update("items/"+item.itemId, {
                    text : item.text,
                    updated : item.updated
                })
                callback (true, item)
            }
        }) 
    }
    
    static markDone(user : string, callback :  ItemHandler) {
        
        this.fetch(user, 0, (success, item)=>{
            if(!item){
                /* Nothing there to mark as complete! */
                throw "DONE??? BUT NOTHING THERE!"
            }
            else if (item.done){
                /* Already completed! */
                throw "DONE ON COMPLETED ITEM!"
            }
            else{
                item.done = true
                Database.sharedDatabase().update("items/"+item.itemId, {
                    done : true,
                })
                callback (true, item)
            }
        }) 
    }
    
    static fetch(user : string, day : number, callback :  ItemHandler) {
        var date =  parseInt(this.getToday(), 10)
        date +=day
        Database.sharedDatabase().findEqual("items", "primary", date+user, (data, error) => {
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
                        item.done = fetched.done
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
        let gmtDate = Math.round(new Date().getTime())
        let istDate = gmtDate + ((5*60+30)*60*1000)
        
        let date = new Date (istDate)
        
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        var dateOfMonth = date.getDate().toString();
        return year + (month[1] ? month : "0" + month[0]) + (dateOfMonth[1] ? dateOfMonth : "0" + dateOfMonth[0]); 
    }
    
}

export = Item