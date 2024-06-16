import * as items from '../../data/items.json'

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

function rollItem(drone:any) {
    const randRare = Math.random()
    const raritytable = [
        [1,1,1,1,1,1],
        [.8,1,1,1,1,1],
        [.6,.9,1,1,1,1],
        [.5,.8,.95,1,1,1],
        [.45,.75,.9,.97,1,1],
        [.44,.75,.89,96,.99,1]
    ]
    let rarity = 0;
    for(let i = 0; i < raritytable[drone.quality-1].length; i++) {
        if(randRare < raritytable[drone.quality-1][i]) {
            rarity = i;
            break;
        }
    }
    let itemlist: any= {}
    for(let [key,obj] of Object.entries(items)) {
        if(obj.rarity == rarity) {
            itemlist[key] = obj
        }
    }
    let sum = 0;
    for(let [key,obj] of Object.entries(itemlist) ) {
        sum+=(obj as any).weight
    }
    const randItem = Math.random()*sum
    sum = 0
    for(let [key,obj] of Object.entries(itemlist) ) {
        sum+=(obj as any).weight
        if(randItem < sum) {
            return `items.${key}`
        }
    }
    

    return 'items.spacesilk'
}