import * as items from '../../data/items.json'

module.exports = (drone:any) => {
    const randRare = Math.random()
    //Table of the chances to get each item rarity based on rank
    const raritytable = [
        [1,1,1,1,1,1],
        [.8,1,1,1,1,1],
        [.6,.9,1,1,1,1],
        [.5,.8,.95,1,1,1],
        [.45,.75,.9,.97,1,1],
        [.44,.75,.89,96,.99,1]
    ]

    //randomly choose the rarity
    let rarity = 0;
    for(let i = 0; i < raritytable[drone.quality-1].length; i++) {
        if(randRare < raritytable[drone.quality-1][i]) {
            rarity = i;
            break;
        }
    }

    //Get a list of every item in that rarity
    let itemlist: any= {}
    for(let [key,obj] of Object.entries(items)) {
        if(obj.rarity == rarity) {
            itemlist[key] = obj
        }
    }

    //Randomly choose the item.
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