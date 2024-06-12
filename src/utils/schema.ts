import * as mongoose from 'mongoose'
import * as items from '../../data/items.json'
import * as pets from '../../data/pets.json'

let itemSchema = new mongoose.Schema()

for(let [key,value] of Object.entries(items)) {
    itemSchema.add({[key]:{type:Number,default:0}})
}

let petSchema = new mongoose.Schema({
    petid: {type:Number,default:0,required:true},
    petname: {type:String,default:''}
})

const baseSchema = new mongoose.Schema({
    userid: {type: String,require:true, unique:true}, 
    balance: {type: Number, default: 1000}, 
    items: {type: itemSchema, default: () => ({})},
    badgetier: {type:Number,default:0},
    badgedate: {type:Date, default: Date.now},
    pet: {type:Number, default:-1},
    pets: {type:[petSchema], default: []}
    });

const UserModel = mongoose.model('Base', baseSchema);

module.exports = UserModel;