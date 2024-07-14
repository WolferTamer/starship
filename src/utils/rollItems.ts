let rollItem = require('./rollItem')

module.exports = (drone: any) => {
    let items: any= {};
    for(let i = 0; i < drone.amount; i++) {
        const item : string = rollItem(drone)
        if(items[item]){
            items[item]+=1
        } else {
            items[item] = 1
        }
    }
    return items
}