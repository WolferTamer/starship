import { Client } from 'discord.js';
import * as pets from '../../data/pets.json'
import items from '../../data/items.json'
const UserModel = require('../utils/schema')
const rollItem = require('./rollItem')

//A method to be called and added to the postfix of a message. It take in the equipped pet and gives a chance for a
//random event to happen.
module.exports = async (profileData: any, client: Client) => {
    if(profileData.pet < 0) { return; }
    const pet =  pets.pets[profileData.pets[profileData.pet].petid]
    const chance = pet.postchance
    const rand = Math.random()
    let petInstance = profileData.pets[profileData.pet]
    if(rand < chance) {
        if(profileData.pets[profileData.pet].petid == 0) {
            let randItem = rollItem({quality:profileData.badgetier})
            const id = randItem.split('.')[1]
            giveItem(randItem,profileData,2)
            items
            return `${client.emojis.cache.get(pet.icon)} ${profileData.pets[profileData.pet].petname} gave you 2 ${items[id as keyof typeof items].name}`
        } else if(profileData.pets[profileData.pet].petid == 1){
            if(petInstance.progress == 0) {
                try {
                    const response = await UserModel.findOneAndUpdate({
                        userid: profileData.userid
                    }, {
                        $inc: {[`pets.${profileData.pet}.progress`]:1}
                    });
                    setTimeout(async () => {
                        const response = await UserModel.findOneAndUpdate({
                            userid: profileData.userid
                        }, {
                            $set: {[`pets.${profileData.pet}.progress`]:0}
                        });
                    }, 120_000)
                    return `${client.emojis.cache.get(pet.icon)} ${profileData.pets[profileData.pet].petname} wants to play fetch! Use 5 commands within 2 minutes to get a reward.`
                } catch(e) {
                    console.log(e);
                }
            } else if(petInstance.progress < 5) {
                const response = await UserModel.findOneAndUpdate({
                    userid: profileData.userid
                }, {
                    $inc: {[`pets.${profileData.pet}.progress`]:1}
                });
            } else {
                const response = await UserModel.findOneAndUpdate({
                    userid: profileData.userid
                }, {
                    $set: {[`pets.${profileData.pet}.progress`]:0},
                });
                let randItem = rollItem({quality:profileData.badgetier})
                const id = randItem.split('.')[1]
                giveItem(randItem, profileData,5)
                return `${client.emojis.cache.get(pet.icon)} You finished playing fetch and were awarded 5 ${items[id as keyof typeof items].name}`
            }
        }
    }
}

async function giveItem(item:string, profileData: any, amount: number) {
    try {
        const response = await UserModel.findOneAndUpdate({
            userid: profileData.userid
        }, {
            $inc: {[item]:amount}
        });
    } catch(e) {
        console.log(e);
    }
}