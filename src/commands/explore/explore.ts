import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, InteractionResponse, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from "../../../data/items.json";
import 'dotenv/config'
const UserModel = require('../../utils/schema')
const tierToName = require('../../utils/tierToname')
const roundOfCombats = require('../../utils/roundOfCombat')
const weaponQualityMod = require('../../utils/weaponQualityMod')
const rollEncounter = require('../../utils/rollEncounter')
import encounters from '../../../data/encounters.json'

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('explore')
    .setDescription('Gather items and fight other starships.'),
    cooldown:60,
	data: new SlashCommandBuilder()
		.setName('explore')
		.setDescription('Explore and engage in combat to earn rewards!'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {

        const embed = new EmbedBuilder()
            .setTitle("Are you ready to begin?")
            .setDescription("You have 5 minutes or until you run out of health to complete as much as you can.")
            .setColor(0xFF0000)
        const startButton = new ButtonBuilder()
            .setCustomId('startexplore')
            .setLabel('Begin')
            .setStyle(ButtonStyle.Success)
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(startButton)
        
        const response = await interaction.reply({embeds:[embed],components:[actionRow]})

        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000, filter });
        //Create the play object, an array of all the weapons they'll use.
        let player :any[] = []
        for(let userWep of profileData.weapons) {
            const wepModifier = weaponQualityMod(userWep.grade)
            const wepInfo = weapons[userWep.weaponid as keyof typeof weapons]
            let defMod = 0;
            let speedMod = 0;
            let healthMod = 0;
            let damMod = 0;
            if(userWep.slot == 1) {
                defMod = 3;
            } else if (userWep.slot == 2) {
                speedMod = .5
            } else if (userWep.slot == 3) {
                damMod = 5
            } else if (userWep.slot == 4) {
                healthMod = 20
            }
            if(profileData.pets[profileData.pet].petid == 7) {
                damMod += 5
            }
            player.push({
                damage:wepInfo.damage*wepModifier + damMod,
                health:wepInfo.health*wepModifier + healthMod,
                attacksenemies:wepInfo.attacksenemies,
                defense:wepInfo.defense + defMod,
                atp:wepInfo.apt*wepModifier + speedMod,
                attackStore:Math.max(1,wepInfo.apt*wepModifier),
                weaponid:userWep.weaponid,
                maxTargets:wepInfo.maxTargets,
                behavior:wepInfo.behavior,
                name:wepInfo.name,
                dead:false
            })
        }
        collector.once('collect', async i => {
            if(i.customId==='startexplore') {
                let info = ''
                if(profileData.pets[profileData.pet].petid == 9) {
                    info = 'boost'
                }
                const roll = rollEncounter(info,profileData);
                const encounter = roll.value;
                const type = roll.type;
                i.deferUpdate()
                player = await handleNewEncounter(type,encounter,player,response,profileData)
            }
        })

        collector.on('collect', async i => {
            if(i.customId==='continueexplore') {
                const roll = rollEncounter('',profileData);
                const encounter = roll.value;
                const type = roll.type;
                i.deferUpdate()
                player = await handleNewEncounter(type,encounter,player,response, profileData)
            }else if (i.customId==='choosecombat') {
                const roll = rollEncounter('combat',profileData);
                const encounter = roll.value;
                const type = roll.type;
                i.deferUpdate()
                player = await handleNewEncounter(type,encounter,player,response, profileData)
            }else if (i.customId==='chooseboost') {
                const roll = rollEncounter('boost',profileData);
                const encounter = roll.value;
                const type = roll.type;
                player = await handleNewEncounter(type,encounter,player,response, profileData)
                i.deferUpdate()
            }else if (i.customId==='choosereward') {
                const roll = rollEncounter('reward',profileData);
                const encounter = roll.value;
                const type = roll.type;
                player = await handleNewEncounter(type,encounter,player,response, profileData)
                i.deferUpdate()
            }
        })
    }
}

async function handleNewEncounter(type:string, encounter:any,player:any, response: InteractionResponse<boolean>, profileData: any) {
    switch(type) {
        case 'combat': {
            return await handleCombat(encounter,player,response, profileData)
        } case 'boost': {
            return handleBoost(encounter,player, response)
        } case 'choice': {
            return handleChoice(encounter,player, response)
        } default: {
            return (await handleReward(encounter,player,response))
        }
    }
}

function handleBoost(encounter: typeof encounters.boost[0],player:any, response: InteractionResponse<boolean>) {
    let healthEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'health' && object.guild.id == process.env.GUILD)
    let damageEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'damage' && object.guild.id == process.env.GUILD)
    let armorEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'defense' && object.guild.id == process.env.GUILD)
    let hitEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'hit' && object.guild.id == process.env.GUILD)
    
    const embed = new EmbedBuilder()
        .setTitle('Exploration')
        .setDescription(encounter.description)
        .setColor(0x00FF00)
        let text = ''
    for(let index of encounter.targets) {
        if(index == 4) {
            let rand = Math.random()
            let total = 0;
            for(let obj of player) {
                if(!obj.dead){
                    total++
                }
            }
            rand *= total;
            total = 0;
            for(let i = 0; i < player.length; i++) {
                if(!player[i].dead){
                    total++
                    if(rand < total) {
                        index = i
                        break;
                    }
                }
            }
        }
        if(!player[index].dead) {
            player[index][encounter.key]+=encounter.value
            if(encounter.key === 'health') {
                text += `+${encounter.value}${healthEmoji}: ${player[index].name}\n`
            } else if(encounter.key === 'damage') {
                text += `+${encounter.value}${damageEmoji}: ${player[index].name}\n`
            } else if(encounter.key === 'defense') {
                text += `+${encounter.value}${armorEmoji}: ${player[index].name}\n`
            }
        }
    }
    embed.addFields([{
        name:`Boosts:`,value:text
    }])
    const continueBtn = new ButtonBuilder()
        .setCustomId('continueexplore')
        .setLabel('Continue')
        .setStyle(ButtonStyle.Primary)
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(continueBtn)
    
    response.edit({embeds:[embed],components:[actionRow]})

    return player
}

function handleChoice(encounter: typeof encounters.choice[0],player:any, response: InteractionResponse<boolean>) {
    const embed = new EmbedBuilder()
        .setTitle('Exploration')
        .setDescription(encounter.description)
        .setColor(0xFFFF00)
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
    for(let [type,text] of Object.entries(encounter.choices)) {
        const button = new ButtonBuilder()
            .setCustomId(`choose${type}`)
            .setLabel(text)
            .setStyle(ButtonStyle.Primary)
        actionRow.addComponents(button)
    }
    
    response.edit({embeds:[embed],components:[actionRow]})

    return player
}

async function handleReward(encounter: typeof encounters.reward[0],player:any, response: InteractionResponse<boolean>) {
    const embed = new EmbedBuilder()
        .setTitle('Exploration')
        .setDescription(encounter.description)
        .setColor(0x0000FF)
    let data  : any = {}
    let text = ''
    for(let obj of encounter.rewards) {
        data[`items.${obj.id}`] = obj.value
        const item = items[obj.id as keyof typeof items]
        text += `${obj.value} x ${response.interaction.client.emojis.cache.get(item.emoji)} ${item.name}\n`
    }
    embed.addFields([
        {name:'Rewards:',value:text}
    ])
    try {
        const response2 = await UserModel.findOneAndUpdate({
            userid: response.interaction.user.id
        }, {
            $inc: data
        });
    }catch(e) {
        console.log(e)
        return player;
    }
    const continueBtn = new ButtonBuilder()
        .setCustomId('continueexplore')
        .setLabel('Continue')
        .setStyle(ButtonStyle.Primary)
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(continueBtn)
    
    response.edit({embeds:[embed],components:[actionRow]})

    return player
}

async function handleCombat(encounter: typeof encounters.combat[0],player:any, response: InteractionResponse<boolean>, profileData: any) {
    let healthEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'health' && object.guild.id == process.env.GUILD)
    let damageEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'damage' && object.guild.id == process.env.GUILD)
    let armorEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'health' && object.guild.id == process.env.GUILD)
    let hitEmoji = response.interaction.client.emojis.cache.find((object)=> object.name == 'hit' && object.guild.id == process.env.GUILD)
    const embed = new EmbedBuilder()
        .setTitle('Exploration')
        .setDescription(encounter.description)
        .setColor(0x0000FF)
    const continueBtn = new ButtonBuilder()
        .setCustomId('continueexplore')
        .setLabel('Continue')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true)
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(continueBtn)
    let enemy = []
    for(let userWep of encounter.weapons) {
        const wepModifier = weaponQualityMod(userWep.grade)
        const wepInfo = weapons[userWep.weaponid as keyof typeof weapons]
        enemy.push({
            damage:wepInfo.damage*wepModifier,
            health:wepInfo.health*wepModifier,
            attacksenemies:wepInfo.attacksenemies,
            defense:wepInfo.defense,
            atp:wepInfo.apt*wepModifier,
            attackStore:Math.max(1,wepInfo.apt*wepModifier),
            weaponid:userWep.weaponid,
            maxTargets:wepInfo.maxTargets,
            behavior:wepInfo.behavior,
            name:wepInfo.name,
            dead:false
        })
    }
    let sleep = async (ms:number) => await new Promise(r => setTimeout(r,ms));
    let tempPlayer = player
    let tempEnemy = enemy
    while(true) {
        let playersDead = 0;
        let enemiesDead = 0
        embed.setFields([])
        for(let i = 0; i < player.length || i < enemy.length; i++) {
            if(player[i]) {
                let tookdamage = ''
                let damageTaken = ''
                if(player[i].health != tempPlayer[i].health) {
                    tookdamage = `${hitEmoji}`
                    damageTaken = `${tempPlayer[i].health - player[i].health}`
                }
                embed.addFields([
                    {name:`Player ${player[i].name} ${tookdamage}`,value:`${player[i].health} ${healthEmoji} ${-damageTaken}`,inline:true}
                ])
                if(player[i].dead) {playersDead++}
            }else {
                embed.addFields([
                { name: '** **', value: '** **', inline:true }
            ])
            }
            if(enemy[i]) {
                let tookdamage = ''
                let damageTaken = ''
                if(enemy[i].health != tempEnemy[i].health) {
                    tookdamage = `${hitEmoji}`
                    damageTaken = `${tempEnemy[i].health - enemy[i].health}`
                }
                embed.addFields([
                    {name:`Enemy ${enemy[i].name} ${tookdamage}`,value:`${enemy[i].health} ${healthEmoji} ${-damageTaken}`,inline:true}
                ])
                if(enemy[i].dead) {enemiesDead++}
            }
            embed.addFields([
                { name: '** **', value: '** **' }
            ])
        }
        if(enemiesDead == enemy.length) {
            let data:any = {}
            let text = 'You won and were awarded: \n'
            for(let obj of encounter.rewards) {
                data[`items.${obj.id}`] = obj.value
                const item = items[obj.id as keyof typeof items]
                text += `${obj.value} x ${response.interaction.client.emojis.cache.get(item.emoji)} ${item.name}\n`
            }
            if(profileData.pets[profileData.pet].petid == 8) {
                for(let obj of player) {
                    if(!obj.dead) {
                        obj.health+=20;
                        text+=`+20${healthEmoji}: ${obj.name}\n`
                    }
                }
            }
            if(profileData.pets[profileData.pet].petid == 3 && profileData.pets[profileData.pet].progress == 0) {
                for(let obj of player) {
                    if(obj.dead) {
                        obj.health = 1;
                        obj.dead = false;
                        profileData.progress = 1
                        text += `Your mouse revived an ally!\n`
                        break;
                    }
                }
            }
            try {
                const response2 = await UserModel.findOneAndUpdate({
                    userid: response.interaction.user.id
                }, {
                    $inc: data
                });
            }catch(e) {
                console.log(e)
                return player;
            }
            embed.setColor(0x00FF00)
            embed.setDescription(text)
            continueBtn.setDisabled(false)
            actionRow.setComponents(continueBtn)
            break;
        } else if (playersDead == player.length) {
            embed.setColor(0xFF0000)
            embed.setFooter({text:'You lost, your journey has come to an end.'})
            break;
        }
        tempPlayer = structuredClone(player)
        tempEnemy = structuredClone(enemy)
        response.edit({embeds:[embed],components:[actionRow]})
        let result:any = roundOfCombats(player,enemy)
        player = result.player
        enemy = result.enemy
        await sleep(3000)
    }
    response.edit({embeds:[embed],components:[actionRow]})
    return player
}