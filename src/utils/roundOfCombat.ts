module.exports = (player: any, enemy:any) => {
    //Loop through every player & enemy, handling both the enemy and player weapon at the same time.
    for(let i = 0; i < player.length || i < enemy.length; i++) {
        if(player[i] && !player[i].dead) {
            let weapon = player[i]
            //Use the held weapon's attackstore to determine the amount of attacks to use.
            while(weapon.attackStore >= 1) {
                let targets = []

                //Gather an array of potential targets
                if(weapon.attacksenemies) {
                    for(let j = 0; j < enemy.length; j++) {
                        targets.push(j)
                    }
                } else {
                    for(let j = 0; j < player.length; j++) {
                        targets.push(j)
                    }
                }

                //Filter out the array of targets based on behavior.
                if(weapon.behavior === 'lowesthealth') {
                    while(targets.length > weapon.maxTargets) {
                        let max = Math.max(...targets.map((o:number)=>{if(weapon.attacksenemies) {return enemy[o].health;} return player[o].health}));
                        for(let j = 0; j < targets.length; j++) {
                            if((!weapon.attacksenemies && player[targets[j]].health == max) || (weapon.attacksenemies &&enemy[targets[j]].health == max)) {
                                targets.splice(j,1);
                                break;
                            }
                        }
                    }
                } else {
                    while(targets.length > weapon.maxTargets) {
                        let max = Math.min(...targets.map((o:number)=>{if(weapon.attacksenemies) {return enemy[o].health;} return player[o].health}));
                        for(let j = 0; j < targets.length; j++) {
                            if((!weapon.attacksenemies && player[targets[j]].health == max) || (weapon.attacksenemies &&enemy[targets[j]].health == max)) {
                                targets.splice(j,1);
                                break;
                            }
                        }
                    }
                }

                //For every target deal damage
                for(let j = 0; j < targets.length; j++) {
                    if(weapon.attacksenemies) {
                        enemy[targets[j]].health -= weapon.damage
                        if(weapon.damage > 0) {
                            //add health back based on the defense of the enemy, never healing more than the amount of damage dealt.
                            enemy[targets[j]].health += Math.min(enemy[targets[j]].defense,weapon.damage)
                        }
                        if(enemy[targets[j]].health <= 0) {
                            //if the enemy's health is below 0 mark them as dead.
                            enemy[targets[j]].health = 0
                            enemy[targets[j]].dead = true;
                        }
                    } else {
                        //same process with other set of targets.
                        player[targets[j]].health -= weapon.damage
                        if(weapon.damage > 0) {
                            player[targets[j]].health += Math.min(player[targets[j]].defense,weapon.damage)
                        }
                        if(player[targets[j]].health <= 0) {
                            player[targets[j]].health = 0
                            player[targets[j]].dead = true;
                        }
                    }
                }
                //lower the attackstore by one
                weapon.attackStore-=1;
            }
            //refresh the attack store with the weapon's atp
            weapon.attackStore+=weapon.atp;
        }
        //repeat the same process with the enemy instance
        if(typeof enemy[i]!== 'undefined' && !enemy[i].dead) {
            let weapon = enemy[i]
            while(weapon.attackStore >= 1) {
                let targets = []
                if(weapon.attacksenemies) {
                    for(let j = 0; j < player.length; j++) {
                        targets.push(j)
                    }
                } else {
                    for(let j = 0; j < enemy.length; j++) {
                        targets.push(j)
                    }
                }
                //Determine targets
                if(weapon.behavior === 'lowesthealth') {
                    while(targets.length > weapon.maxTargets) {
                        let max = Math.max(...targets.map((o:number)=>{if(weapon.attacksenemies) {return player[o].health;} return enemy[o].health}));
                        for(let j = 0; j < targets.length; j++) {
                            if((weapon.attacksenemies && player[targets[j]].health == max) || (!weapon.attacksenemies &&enemy[targets[j]].health == max)) {
                                targets.splice(j,1);
                                break;
                            }
                        }
                    }
                } else {
                    while(targets.length > weapon.maxTargets) {
                        let max = Math.min(...targets.map((o:number)=>{if(weapon.attacksenemies) {return player[o].health;} return enemy[o].health}));
                        for(let j = 0; j < targets.length; j++) {
                            if((weapon.attacksenemies && player[targets[j]].health == max) || (!weapon.attacksenemies &&enemy[targets[j]].health == max)) {
                                targets.splice(j,1);
                                break;
                            }
                        }
                    }
                }
                //Deal damage
                for(let j = 0; j < targets.length; j++) {
                    if(weapon.attacksenemies) {
                        player[targets[j]].health -= weapon.damage
                        if(weapon.damage > 0) {
                            player[targets[j]].health += Math.min(player[targets[j]].defense,weapon.damage)
                        }
                        if(player[targets[j]].health <= 0) {
                            player[targets[j]].health = 0
                            player[targets[j]].dead = true;
                        }
                    } else {
                        enemy[targets[j]].health -= weapon.damage
                        if(weapon.damage > 0) {
                            enemy[targets[j]].health += Math.min(enemy[targets[j]].defense,weapon.damage)
                        }
                        if(enemy[targets[j]].health <= 0) {
                            enemy[targets[j]].health = 0
                            enemy[targets[j]].dead = true;
                        }
                    }
                }
                weapon.attackStore-=1;
            }
            weapon.attackStore+=weapon.atp;
        }
    }
    return {player:player,enemy:enemy}
}