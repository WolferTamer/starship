module.exports = (player: any, enemy:any) => {
    
    for(let i = 0; i < player.length || i < enemy.length; i++) {
        if(player[i] && !player[i].dead) {
            let weapon = player[i]
            
            let targets = []
            if(weapon.attacksenemies) {
                for(let j = 0; j < enemy.length; j++) {
                    targets.push(j)
                }
            } else {
                for(let j = 0; j < player.length; j++) {
                    targets.push(j)
                }
            }
            if(weapon.behavior === 'lowesthealth') {
                while(targets.length > weapon.maxTargets) {
                    let max = Math.max(...targets.map((o:number)=>{if(weapon.attacksenemies) {return enemy[o].health;} return player[o].health}));
                    for(let j = 0; j < targets.length; j++) {
                        if(enemy[targets[j]].health == max) {
                            targets.splice(j,1);
                            break;
                        }
                    }
                }
            } else {
                while(targets.length > weapon.maxTargets) {
                    let max = Math.min(...targets.map((o:number)=>{if(weapon.attacksenemies) {return enemy[o].health;} return player[o].health}));
                    for(let j = 0; j < targets.length; j++) {
                        if(enemy[targets[j]].health == max) {
                            targets.splice(j,1);
                            break;
                        }
                    }
                }
            }

            for(let j = 0; j < targets.length; j++) {
                if(weapon.attacksenemies) {
                    enemy[targets[j]].health -= weapon.damage
                    if(enemy[targets[j]].health <= 0) {
                        enemy[targets[j]].health = 0
                        enemy[targets[j]].dead = true;
                    }
                } else {
                    player[targets[j]].health -= weapon.damage
                    if(player[targets[j]].health <= 0) {
                        player[targets[j]].health = 0
                        player[targets[j]].dead = true;
                    }
                }
            }
        }
        if(typeof enemy[i]!== 'undefined' && !enemy[i].dead) {
            let weapon = enemy[i]
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
            if(weapon.behavior === 'lowesthealth') {
                while(targets.length > weapon.maxTargets) {
                    let max = Math.max(...targets.map((o:number)=>{if(weapon.attacksenemies) {return player[o].health;} return enemy[o].health}));
                    for(let j = 0; j < targets.length; j++) {
                        if(player[targets[j]].health == max) {
                            targets.splice(j,1);
                            break;
                        }
                    }
                }
            } else {
                while(targets.length > weapon.maxTargets) {
                    let max = Math.min(...targets.map((o:number)=>{if(weapon.attacksenemies) {return player[o].health;} return enemy[o].health}));
                    for(let j = 0; j < targets.length; j++) {
                        if(player[targets[j]].health == max) {
                            targets.splice(j,1);
                            break;
                        }
                    }
                }
            }
            for(let j = 0; j < targets.length; j++) {
                if(weapon.attacksenemies) {
                    player[targets[j]].health -= weapon.damage
                    if(player[targets[j]].health <= 0) {
                        player[targets[j]].health = 0
                        player[targets[j]].dead = true;
                    }
                } else {
                    enemy[targets[j]].health -= weapon.damage
                    if(enemy[targets[j]].health <= 0) {
                        enemy[targets[j]].health = 0
                        enemy[targets[j]].dead = true;
                    }
                }
            }
        }
    }
    return {player:player,enemy:enemy}
}