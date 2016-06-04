
/**
 * Today
 * Date wrapper to get/set YYYYMMDD respresentation of the day
 */
class Today {
    static timezoneCorrection : number = 0//((5*60+30)*60*1000)
    /**
     * Only year, month, date component will be correct
     * Time component will be zero
     */
    private date : Date
    
    constructor(days : number = 0) {
        let currentTime = Math.round(new Date().getTime())
        currentTime += Today.timezoneCorrection
        currentTime += days*24*60*60*1000
        let date = new Date(currentTime)
        date.setHours(0, 0, 0, 0)
        this.date = date
    }
    
     public toDate () : Date {
        return this.date;
    }
    
    /** 
     * Returns YYYYMMDD representation of date in number
    */
     public toNumber () : number {
        let year = this.date.getFullYear().toString();
        let month = (this.date.getMonth() + 1).toString();
        let dateOfMonth = this.date.getDate().toString();

        let today = year + (month[1] ? month : "0" + month[0]) + (dateOfMonth[1] ? dateOfMonth : "0" + dateOfMonth[0]);

        return parseInt(today, 10); 
    }
    
    public toString () : string {
        return this.toNumber().toString();
    }
    
    /** 
     * Returns Difference in days between two dates basically (Can be zero or negative)
     * (argument - this)
    */
     public daysTo (today:Today) {
        let timeDiff = today.date.getTime() - this.date.getTime();
        
        let differenceInDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return  differenceInDays;
    }
    
    /** 
     * Returns Today Object from YYYYMMDD representation of date in number
    */
    static fromNumber (num : number) : Today {
        let dateOfMonth = num % 100
        if(dateOfMonth <= 0 || dateOfMonth > 31)
            throw "Today - Invalid Month"
        
        num = Math.floor(num / 100)
        let month = num % 100
        if(month <= 0 || month > 12)
            throw "Today - Invalid Month"

        let year = Math.floor(num / 100)
        if(year <= 0)
            throw "Today - Invalid Year"
        
        let today = new Today()
        today.date = new Date(year, month-1, dateOfMonth);

        return today
    }
}

export = Today
