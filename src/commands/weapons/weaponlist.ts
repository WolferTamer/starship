import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, ComponentType, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from "../../../data/items.json";
const UserModel = require('../../utils/schema')

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('weaponlist')
    .setDescription('A list of all available weapons.'),
	data: new SlashCommandBuilder()
		.setName('weaponlist')
		.setDescription('View all available weapons.'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const embed = new EmbedBuilder()
            .setTitle(`Weapons`)
            .setColor(0xbf3115)
        embed.setFields(buildEntries(0))

        const upButton = new ButtonBuilder()
            .setEmoji('⬆️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wlistup')
            .setDisabled(true)
        const downButton = new ButtonBuilder()
            .setEmoji('⬇️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wlistdown')
        const selectButton = new ButtonBuilder()
            .setLabel('Select')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wlistselect')
        const backButton = new ButtonBuilder()
            .setLabel('Back')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('wlistback')
        const craftButton = new ButtonBuilder()
            .setLabel('Craft')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wlistcraft')
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(upButton,selectButton,downButton)
        let response = await interaction.reply({embeds:[embed],components:[actionRow]})

        let index = 0;

        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });
    
        collector.on('collect', async i => {
            let curWeapon = Object.values(weapons)[index]
            let curKey = Object.keys(weapons)[index]
            if(i.customId === 'wlistup') {
                index--;
                downButton.setDisabled(false)
                if(index == 0) {
                    upButton.setDisabled(true)
                }
                embed.setFields(buildEntries(index))
                response.edit({embeds:[embed],components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'wlistdown') {
                index++;
                upButton.setDisabled(false)
                if(index == Object.keys(weapons).length-1) {
                    downButton.setDisabled(true)
                }
                embed.setFields(buildEntries(index))
                response.edit({embeds:[embed],components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'wlistselect') {
                const weaponEmbed = buildEmbed(curWeapon,interaction.client)
                actionRow.setComponents(backButton,craftButton)
                response.edit({embeds:[weaponEmbed],components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'wlistback') {
                actionRow.setComponents(upButton,selectButton,downButton) 
                response.edit({embeds:[embed],components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'wlistcraft') {
                try {
                    let data : any = {}
                    const ingredients = curWeapon.ingredients
                    for(let [key,obj] of Object.entries(ingredients)) {
                        let item = items[key as keyof typeof items]
                        if(profileData.items[key] < obj) {
                            i.reply({content:`You don't have enough ${item.name} to craft this weapon.`,ephemeral:true})
                            return;
                        }
                        data[`items.${key}`] = -obj
                    }
                    const mongoResponse = await UserModel.findOneAndUpdate({
                        userid: response.interaction.user.id
                    }, {
                        $inc: data,
                        $push: {
                            weaponstorage:{weaponid:curKey}
                        }
                    });
                   i.reply('Weapon crafted!')
                } catch(e) {
                    console.log(e)
                    i.reply(`An error occured. Please try again.`)
                }
            }
        })
	},
};

function buildEntries(indexNum: number) {
    let weaponArray = Object.values(weapons)
    let keys = Object.keys(weapons)
    let fields:any = []
    for(let i = 0; i < weaponArray.length; i++) {
        let name = `${weaponArray[i].name}`
        if(i == indexNum) {
            name = `🟢 ${weaponArray[i].name}`
        }
        let text = ``
            if(weaponArray[i].attacksenemies) {
                text+=`Attacks up to ${weaponArray[i].maxTargets} enemies for ${weaponArray[i].damage} health ${weaponArray[i].apt} times per turn\nID: ${keys[i]}`
            } else {
                text+=`Heals up to ${weaponArray[i].maxTargets} allies for ${-weaponArray[i].damage} health ${weaponArray[i].apt} times per turn.\nID: ${keys[i]}`
            }
        fields.push({name:name,value:text})
    }
    return fields
}

function buildEmbed(weapon: any, client: Client) {
    let ingredientText = ``
        for(let [key,obj] of Object.entries(weapon.ingredients)) {
            ingredientText+=`${obj} x ${client.emojis.cache.get(items[key as keyof typeof items].emoji)} ${items[key as keyof typeof items].name}\n`
        }
        let statText = `Targets: `
        if(weapon.attacksenemies) {
            statText+='Enemies\n'
        } else {
            statText+= 'Allies\n'
        }
        statText+=`Damage: ${weapon.damage}\nMax Targets: ${weapon.maxTargets}\nAttacks Per Turn: ${weapon.apt}\nBehavior: `
        if(weapon.behavior === 'lowesthealth') {
            statText+=`Attacks targets with lowest health`
        } else if(weapon.behavior === 'highesthealth') {
            statText+=`Attacks targets with highest health`
        } else if(weapon.behavior === 'lowestdefense') {
            statText+=`Attacks targets with lowest armor`
        } else if(weapon.behavior === 'highestdefense') {
            statText+=`Attacks targets with highest armor`
        }

        const embed = new EmbedBuilder()
            .setTitle(weapon.name)
            .setColor(0xbf3115)
            .setFields([
                {
                    name:'Ingredients',
                    value:ingredientText
                }, {
                    name:'Stats',
                    value:statText
                }
            ])
            return embed
}