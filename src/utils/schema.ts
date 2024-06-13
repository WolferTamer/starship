import * as mongoose from 'mongoose'
import * as items from '../../data/items.json'
import * as pets from '../../data/pets.json'

let itemSchema = new mongoose.Schema()

//Dynamically adds a count entries for all the items in /data/items.json
for(let [key,value] of Object.entries(items)) {
    itemSchema.add({[key]:{type:Number,default:0}})
}

//A template for pets. May have levels in the future.
let petSchema = new mongoose.Schema({
    petid: {type:Number,default:0,required:true},
    petname: {type:String,default:''}
});

const weaponSchema = new mongoose.Schema({
    id: {type:Number, default:-1},
    grade: {type:Number,default:1}
});

const droneSchema = new mongoose.Schema({
    speed: {type:Number,default:1},
    quality: {type:Number,default:1},
    travel: {type:Number,default:1},
    amount: {type:Number,default:10}
});

const baseSchema = new mongoose.Schema({
    userid: {type: String,require:true, unique:true}, 
    balance: {type: Number, default: 1000}, 
    items: {type: itemSchema, default: () => ({})},
    badgetier: {type:Number,default:0},
    badgedate: {type:Date, default: Date.now},
    pet: {type:Number, default:-1},
    pets: {type:[petSchema], default: []},
    muted: {type:Boolean, default: false},
    weapons: {type:[weaponSchema],default:[{id:0,grade:1},{id:0,grade:1},{id:0,grade:1}]},
    drones: {type:[droneSchema],default:[{}]}
    });

const UserModel = mongoose.model('Base', baseSchema);

module.exports = UserModel;