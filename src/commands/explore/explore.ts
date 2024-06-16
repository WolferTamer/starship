import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, InteractionResponse, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from "../../../data/items.json";
const UserModel = require('../../utils/schema')
const tierToName = require('../../utils/tierToname')
const weaponQualityMod = require('../../utils/weaponQualityMod')
const rollEncounter = require('../../utils/rollEncounter')
import encounters from '../../../data/encounters.json'

module.exports = {
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
        let player :any[] = []
        for(let userWep of profileData.weapons) {
            const wepModifier = weaponQualityMod(userWep.grade)
            const wepInfo = weapons[userWep.weaponid as keyof typeof weapons]
            player.push({
                damage:wepInfo.damage*wepModifier,
                health:wepInfo.health*wepModifier,
                defense:wepInfo.defense*wepModifier,
                atp:wepInfo.apt*wepModifier,
                attackStore:1+wepInfo.apt*wepModifier,
                weaponid:userWep.weaponid,
                maxTargets:wepInfo.maxTargets,
                behavior:wepInfo.behavior
            })
        }
        collector.once('collect', async i => {
            if(i.customId==='startexplore') {
                const roll = rollEncounter();
                const encounter = encounters.boost[0];
                const type = 'boost';
                player = await handleNewEncounter(type,encounter,player,response)
                i.deferUpdate()
            }
        })

        collector.on('collect', async i => {
            if(i.customId==='continueexplore') {
                const roll = rollEncounter();
                const encounter = roll.value;
                const type = roll.type;
                player = await handleNewEncounter(type,encounter,player,response)
                i.deferUpdate()
            }else if (i.customId==='choosecombat') {
                const roll = rollEncounter('combat');
                const encounter = roll.value;
                const type = roll.type;
                player = await handleNewEncounter(type,encounter,player,response)
                i.deferUpdate()
            }else if (i.customId==='chooseboost') {
                const roll = rollEncounter('boost');
                const encounter = roll.value;
                const type = roll.type;
                player = await handleNewEncounter(type,encounter,player,response)
                i.deferUpdate()
            }else if (i.customId==='choosereward') {
                const roll = rollEncounter('reward');
                const encounter = roll.value;
                const type = roll.type;
                player = await handleNewEncounter(type,encounter,player,response)
                i.deferUpdate()
            }
        })
    }
}

async function handleNewEncounter(type:string, encounter:any,player:any, response: InteractionResponse<boolean>) {
    switch(type) {
        case 'combat': {
            return player
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
    const embed = new EmbedBuilder()
        .setTitle('Exploration')
        .setDescription(encounter.description)
        .setColor(0x00FF00)
    for(let index of encounter.targets) {
        player[index][encounter.key]+=encounter.value
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
        text += `${obj.value} x ${item.name}\n`
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