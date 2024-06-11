import * as mongoose from 'mongoose'

const baseSchema = new mongoose.Schema({
    userid: {type: String,require:true, unique:true}, 
    balance: {type: Number, default: 1000}, 
    items: {type: Map, of: Number},
    badgetier: {type:Number,default:0},
    badgedate: {type:Date, default: Date.now}
    });

const UserModel = mongoose.model('Base', baseSchema);

module.exports = UserModel;