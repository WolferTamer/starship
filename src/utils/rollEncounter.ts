import encounters from '../../data/encounters.json'

module.exports = (type = '') => {
    let rand = Math.random()
    if(type === '') {
        const chanceTable = {'combat':.5,'choice':.7,'boost':.9,'reward':1};

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
    let sum = 0;
    for(let obj of encounters[type as keyof typeof encounters]) {
        sum+=obj.weight
    }
    rand *=sum
    sum = 0;
    for(let obj of encounters[type as keyof typeof encounters]) {
        sum+=obj.weight
        if(rand < sum) {
           return {type:type,value:obj} 
        }
    }
}