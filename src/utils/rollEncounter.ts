import encounters from '../../data/encounters.json'

module.exports = (type = '', profileData: any) => {
    let rand = Math.random()
    if(type === '') {
        const chanceTable = {'combat':.5,'choice':.7,'boost':.9,'reward':1};
        if(profileData && profileData.pet > 0) {
            const pet = profileData.pets[profileData.pet]
            if(pet.petid == 4) {
                chanceTable.combat = .4
            } else if(pet.petid == 5) {
                chanceTable.combat = .6
                chanceTable.choice = .75
            } else if(pet.petid == 6) {
                chanceTable.combat = .4
                chanceTable.choice = .6
            }
        }

        if(rand < chanceTable.combat) {
            type = 'combat'
        } else if(rand < chanceTable.choice) {
            type = 'choice'
        } else if(rand < chanceTable.boost) {
            type = 'boost'
        } else {
            type = 'reward'
        }
    
    }
    rand = Math.random();
    let newEncounters = encounters[type as keyof typeof encounters].filter((obj) => obj.grade <= profileData.chosenbadge)
    let sum = 0;
    for(let obj of newEncounters) {
        sum+=obj.weight
    }
    rand *=sum
    sum = 0;
    for(let obj of newEncounters) {
        sum+=obj.weight
        if(rand < sum) {
           return {type:type,value:obj} 
        }
    }
}