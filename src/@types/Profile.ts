import * as mongoose from 'mongoose'
import * as items from '../../data/items.json'
import * as pets from '../../data/pets.json'

let itemSchema = new mongoose.Schema()

//Dynamically adds a count entries for all the items in /data/items.json
for(let [key,value] of Object.entries(items)) {
    itemSchema.add({[key]:{type:Number,default:0}})
}

interface QuestIndex {
    commander: number,
    miner: number,
    astronomer: number,
    biologist: number,
    mechanic: number
}

interface QuestProgress {
    giver: string,
    progress: number
}

//A template for pets. May have levels in the future.
interface Pet{
    petid: number,
    petname?: string,
    progress?: number
}

interface Weapon {
    weaponid: string,
    grade: number,
    slot: number
}

interface WeaponStore{
    weaponid: string,
    grade: number
}

interface Drone{
    speed: number,
    quality: number,
    travel: number,
    amount: number,
    sent: Date,
    working: boolean
}

interface Profile{
    userid: string, 
    balance: number, 
    items: { [key: string]: number },
    chosenbadge: number,
    badgetier: number,
    badgedate: Date,
    pet: number,
    pets: Pet[],
    muted: boolean,
    weapons: Weapon[],
    drones: Drone[],
    weaponstorage: WeaponStore[],
    dailytime: Date,
    dailystreak: number,
    quest:QuestProgress,
    questindex: QuestIndex
    }


export {Profile}