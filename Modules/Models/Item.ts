/**
 * Item
 * Represents the review item posted by a user for a particular day.
 */

import Database = require("../Database/Database")
import Today = require("../Extensions/Today")
import Error = require("../Error");

interface ItemHandler {
    (error: number, item: Item) : void
}

interface StreakHandler {
    (success : boolean, streak : boolean[]) : void
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
        
        this.fetch(user, 0, (error, item)=>{
            if(item){
                return callback(Error.Item.AlreadyCreated, null)
            }
            else if (error === Error.Item.NotFound){
                var item = new Item(user, text)
                item.date = new Today().toString()
                item.created = Math.round(new Date().getTime() / 1000)
                item.primary = item.date + item.user
                item.done = false
                item.itemId = Database.sharedDatabase().push("items", item)
                return callback(0, item)
            }
            else{
                return callback(error, null);
            }
        })
    }
    
    static update(user : string, text : string, callback :  ItemHandler) {
        
        this.fetch(user, 0, (error, item)=>{
            if(!item){
                callback (error, null)
            }
            else if (item.done){
                /* Already completed! */
                callback (Error.Item.AlreadyDone, null)
            }
            else{
                item.text = text
                item.updated = Math.round(new Date().getTime()/1000)
                Database.sharedDatabase().update("items/"+item.itemId, {
                    text : item.text,
                    updated : item.updated
                })
                callback (0, item)
            }
        }) 
    }
    
    static markDone(user : string, callback :  ItemHandler) {
        
        this.fetch(user, 0, (error, item)=>{
            if(!item){
                /* Nothing there to mark as complete! */
                callback (error, null)
            }
            else if (item.done){
                /* Already completed! */
                callback (Error.Item.AlreadyDone, null)
            }
            else{
                item.done = true
                Database.sharedDatabase().update("items/"+item.itemId, {
                    done : true,
                })
                callback (0, item)
            }
        }) 
    }
    
    /** 
     * Fetch the task assigned to user on a particular day
     * day = 0 only works
    */
    static fetch(user : string, day : number, callback :  ItemHandler) {
        var date =  new Today().toNumber()
        date +=day //TODO: this wont work!!! 
        
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
                        callback(0, item)
                    }
                    else {
                        throw "ITEM findEqual RETURNS MORE THAN 1"
                    }
                }
                else{
                    callback(Error.Item.NotFound, null)
                }
                
            }
        })
    }
    
    static streak(user : string, day : number, callback : StreakHandler) {
        var date =  new Today(-1*day)
        
        Database.sharedDatabase().findEqual("items", "user", user, (data, error) => {
            if(error){
                throw "ERROR FROM DB"
            }
            else {
                
                var streak : boolean[] = new Array(day)
                for (var index = 0; index < streak.length; index++) {
                    streak[index] = false
                }
                
                if (data) {
                    let keys = Object.keys(data)
                    keys.forEach(itemid => {
                        /* Will get all elements of the user! TODO: Better way to do this? */
                        let fetchedItem = data[itemid]
                        let fetchedItemDate = parseInt(fetchedItem.date, 10)
                        let today = new Today()
                        let index =  Today.fromNumber(fetchedItemDate).daysTo(today)
                        if(index == 0 || index > day){
                            //Today or Older item : Leave item
                        }
                        else{
                            streak[index-1] = fetchedItem.done
                        }
                    });
                    callback(true, streak)
                }
                else{
                    /* Nothing created in this time period */
                    callback(true, streak)
                }
                
            }
        })
    }
    
}

export = Item