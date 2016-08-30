
const Item = {
    NotFound        : 1000,
    AlreadyCreated  : 1001,
    AlreadyDone     : 1002,
    MissingTitle    : 1003,
    CountInvalid    : 1004 
}

const Database = {

}


const description:{[a: number]:string} = {
    1000    :   "Not created yet! use /create command to create new item",
    1001    :   "You have already created a task for today.",
    1002    :   "",
    1003    :   "You need to specify the item title. Like /command title"
}


export = {
    Item,
    description
}