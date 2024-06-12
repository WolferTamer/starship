import * as pets from '../../data/pets.json'
const UserModel = require('../utils/schema')

module.exports = (profileData: any) => {
    if(profileData.pet < 0) { return; }
    const pet =  pets.pets[profileData.pets[profileData.pet].petid]
    const chance = pet.postchance
    const rand = Math.random()

    if(rand < chance) {
        if(profileData.pet == 0) {
            giveItem('spacesilk',profileData)
            return `${profileData.pets[profileData.pet].petname} ${pet.icon} gave you 1 space silk!`
        } else if(profileData.pet == 1){
            return `${profileData.pets[profileData.pet].petname} ${pet.icon} wants to play fetch!`
        }
    }
}

async function giveItem(item:string, profileData: any) {
    try {
        const response = await UserModel.findOneAndUpdate({
            userid: profileData.userid
        }, {
            $inc: {[`items.${item}`]:1}
        });
    } catch(e) {
        console.log(e);
    }
}