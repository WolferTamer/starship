import * as pets from '../../data/pets.json'
const UserModel = require('../utils/schema')

//A method to be called and added to the postfix of a message. It take in the equipped pet and gives a chance for a
//random event to happen.
module.exports = async (profileData: any) => {
    if(profileData.pet < 0) { return; }
    const pet =  pets.pets[profileData.pets[profileData.pet].petid]
    const chance = pet.postchance
    const rand = Math.random()
    let petInstance = profileData.pets[profileData.pet]
    if(rand < chance) {
        if(profileData.pets[profileData.pet].petid == 0) {
            giveItem('spacesilk',profileData)
            return `${profileData.pets[profileData.pet].petname} gave you 1 space silk!`
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
                    return `${profileData.pets[profileData.pet].petname} wants to play fetch! Use 5 commands within 2 minutes to get a reward.`
                } catch(e) {
                    console.log(e);
                }
            }
        }
    } else if (petInstance.petid == 1 && petInstance.progress > 0) {
        if(petInstance.progress < 5) {
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
            giveItem('orbitalore', profileData)
            return `You finished playing fetch and were awarded an orbital ore`
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