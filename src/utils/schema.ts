import * as mongoose from 'mongoose'

const baseSchema = new mongoose.Schema({
    userid: {type: String,require:true, unique:true}, 
    balance: {type: Number, default: 1000}, 
    items: {type: Map, of: Number}});

const UserModel = mongoose.model('Base', baseSchema);

module.exports = UserModel;