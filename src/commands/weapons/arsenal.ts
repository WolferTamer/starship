import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, StringSelectMenuBuilder, StringSelectMenuInteraction, StringSelectMenuOptionBuilder } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from "../../../data/items.json";
const tierToName = require("../../utils/tierToname")
const weaponQualityMod = require("../../utils/weaponQualityMod")
const slotToName = require('../../utils/slotToName')
const UserModel = require('../../utils/schema');

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('arsenal')
    .setDescription('All the weapons you currently have equipped.'),
	data: new SlashCommandBuilder()
		.setName('arsenal')
		.setDescription('View your arsenal of weapons'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        let embeds: EmbedBuilder[] = []
        let i = 0
        for(let userWeapon of profileData.weapons) {
            let weapon = weapons[userWeapon.weaponid as keyof typeof weapons]
            let modifier = weaponQualityMod(userWeapon.grade)
            embeds.push( embedMaker(userWeapon,i))
            i++;
        }
        let prevbutton = new ButtonBuilder()
            .setCustomId('prevweapon')
            .setLabel('<-')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        let nextbutton = new ButtonBuilder()
            .setCustomId('nextweapon')
            .setLabel('->')
            .setStyle(ButtonStyle.Primary)
        let dropdown = new StringSelectMenuBuilder()
            .setCustomId('swapslot')
            .setPlaceholder('Choose the type of this slot (exclusive)')
        let dropdownOptions = [
            new StringSelectMenuOptionBuilder()
                .setLabel('Defense')
                .setValue('defense'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Speed')
                .setValue('speed'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Attack')
                .setValue('attack'),
            new StringSelectMenuOptionBuilder()
                .setLabel('Health')
                .setValue('health')
        ]
        for(let i = 0; i < 4; i++) {
            if(i != profileData.weapons[0].slot-1) {
                dropdown.addOptions(
                    dropdownOptions[i]
                )
            }
        }

        let dropdownActionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .setComponents(dropdown)

        let actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(prevbutton,nextbutton)

        let response = await interaction.reply({embeds:[embeds[0]],components:[actionRow,dropdownActionRow]});

        let index = 0;

        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });

        collector.on('collect', async i => {
            if(i.customId === 'prevweapon') {
                index--;
                if(index == 0) {
                    prevbutton.setDisabled(true)
                }

                dropdown.setOptions([])

                for(let i = 0; i < 4; i++) {
                    if(i != profileData.weapons[index].slot-1) {
                        dropdown.addOptions(
                            dropdownOptions[i]
                        )
                    }
                }

                dropdownActionRow.setComponents(dropdown)

                nextbutton.setDisabled(false)

                actionRow.setComponents(prevbutton,nextbutton)
                response.edit({embeds:[embeds[index]],components:[actionRow,dropdownActionRow]})
                i.deferUpdate()
            } else if (i.customId === 'nextweapon') {
                index++;
                if(index == embeds.length-1) {
                    nextbutton.setDisabled(true)
                }

                dropdown.setOptions([])

                for(let i = 0; i < 4; i++) {
                    if(i != profileData.weapons[index].slot-1) {
                        dropdown.addOptions(
                            dropdownOptions[i]
                        )
                    }
                }

                dropdownActionRow.setComponents(dropdown)

                prevbutton.setDisabled(false)

                actionRow.setComponents(prevbutton,nextbutton)
                response.edit({embeds:[embeds[index]],components:[actionRow,dropdownActionRow]})
                i.deferUpdate()
            }
        })

        const dropdownCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000, filter });
        dropdownCollector.on('collect', async (i : StringSelectMenuInteraction) => {
            if(i.customId==='swapslot') {
                let newType = 0;
                switch(i.values[0]) {
                    case 'defense':newType = 1;break;
                    case 'speed':newType = 2;break;
                    case 'attack':newType = 3;break;
                    case 'health':newType = 4;break;
                }
                if(newType == 0) { i.deferUpdate()}
                let oldSlot = -1
                for(let x = 0; x < profileData.weapons.length; x++) {
                    if(profileData.weapons[x].slot == newType) {
                        oldSlot = x
                    }
                }
                if(oldSlot < 0) {
                    try {
                        profileData = await UserModel.findOneAndUpdate({
                            userid: interaction.user.id
                        }, {
                            $set: {[`weapons.${index}.slot`]:newType}
                        },{new:true});

                        embeds[index] = embedMaker(profileData.weapons[index],index)

                        dropdown.setOptions([])

                        for(let i = 0; i < 4; i++) {
                            if(i != profileData.weapons[index].slot-1) {
                                dropdown.addOptions(
                                    dropdownOptions[i]
                                )
                            }
                        }

                        dropdownActionRow.setComponents(dropdown)
                        i.reply(`The type of slot ${index+1} has been set to ${i.values[0]}`)
                        response.edit({embeds:[embeds[index]],components:[actionRow,dropdownActionRow]})
                        
                    } catch(e) {
                        console.log(e)
                        i.reply({content:`An error occured. Please try again.`, ephemeral:true})
                    }
                } else {
                    try {
                        profileData = await UserModel.findOneAndUpdate({
                            userid: interaction.user.id
                        }, {
                            $set: {[`weapons.${index}.slot`]:newType,
                            [`weapons.${oldSlot}.slot`]:profileData.weapons[index].slot}
                        },{new:true});
                        
                        embeds[oldSlot] = embedMaker(profileData.weapons[oldSlot],oldSlot)
                        embeds[index] = embedMaker(profileData.weapons[index],index)

                        dropdown.setOptions([])

                        for(let i = 0; i < 4; i++) {
                            if(i != profileData.weapons[index].slot-1) {
                                dropdown.addOptions(
                                    dropdownOptions[i]
                                )
                            }
                        }

                        dropdownActionRow.setComponents(dropdown)
                        i.reply(`The types of slot ${index+1} and ${oldSlot+1} have been switched.`)
                        response.edit({embeds:[embeds[index]],components:[actionRow,dropdownActionRow]})
                    } catch(e) {
                        console.log(e)
                        i.reply({content:`An error occured. Please try again.`, ephemeral:true})
                    }
                }
            }
        })
    }
}

function embedMaker(userWeapon:any, i:number) {
    let weapon = weapons[userWeapon.weaponid as keyof typeof weapons]
    let modifier = weaponQualityMod(userWeapon.grade)
    let statText = `Targets: `
            if(weapon.attacksenemies) {
                statText+='Enemies\n'
            } else {
                statText+= 'Allies\n'
            }
            statText+=`Damage: ${weapon.damage*modifier}\nMax Targets: ${weapon.maxTargets}\nBehavior: `
            if(weapon.behavior === 'lowesthealth') {
                statText+=`Attacks targets with lowest health`
            } else if(weapon.behavior === 'highesthealth') {
                statText+=`Attacks targets with highest health`
            } else if(weapon.behavior === 'lowestdefense') {
                statText+=`Attacks targets with lowest armor`
            } else if(weapon.behavior === 'highestdefense') {
                statText+=`Attacks targets with highest armor`
            }

            return new EmbedBuilder()
                .setTitle(`${slotToName(userWeapon.slot)} Slot (${i+1})`)
                .setColor(0xbf3115)
                .setDescription(`${weapon.name} (${tierToName(userWeapon.grade-1)} quality)`)
                .setFields([
                    {
                        name:`⚔️ Stats:`,
                        value:statText
                    }
                ])
}