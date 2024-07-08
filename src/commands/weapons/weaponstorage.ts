import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Client, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from "../../../data/items.json";
const tierToName = require('../../utils/tierToname')
const UserModel = require('../../utils/schema')
const weaponQualityMod = require('../../utils/weaponQualityMod')

//For the redesign: View the ID and info of each weapon. Navigate through the menu to see your weapon's specific stats. Can reforge from this command. Can choose to equip a specific weapon
//Weaponlist is the same, but with generalized weapons. Can craft weapons from that menu.

module.exports = {
    cooldown:60,
    embed: new EmbedBuilder()
    .setTitle('weaponstorage')
    .setDescription('A list of all the weapons you have crafted.'),
	data: new SlashCommandBuilder()
		.setName('weaponstorage')
		.setDescription('View the weapons you have crafted'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        if(profileData.weaponstorage.length < 1) {
            interaction.reply({content:`You don't have any weapons in storage.`,ephemeral:true})
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`Your Weapons`)
            .setColor(0xbf3115)
            .setFields(buildEntries(0,profileData.weaponstorage))

        const upButton = new ButtonBuilder()
            .setEmoji('⬆️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wstoreup')
            .setDisabled(true)
        const downButton = new ButtonBuilder()
            .setEmoji('⬇️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wstoredown')
        const selectButton = new ButtonBuilder()
            .setLabel('Select')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wstoreselect')
        const backButton = new ButtonBuilder()
            .setLabel('Back')
            .setStyle(ButtonStyle.Danger)
            .setCustomId('wstoreback')
        const forgeButton = new ButtonBuilder()
            .setLabel('Reforge')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wstoreforge')
        const equipButton = new ButtonBuilder()
            .setLabel('Equip')
            .setStyle(ButtonStyle.Success)
            .setCustomId('wstoreequip')
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(upButton,selectButton,downButton)

        const dropdown = new StringSelectMenuBuilder()
            .setCustomId('reforgegrade')
            .setPlaceholder('Choose your reforge tier.')
            .setOptions([ new StringSelectMenuOptionBuilder()
                .setDefault(true)
                .setLabel('White Core')
                .setValue('white'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Green Core')
                .setValue('green'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Blue Core')
                .setValue('blue'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Purple Core')
                .setValue('purple'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Red Core')
                .setValue('red'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Orange Core')
                .setValue('orange')
            ])
        const slotDropdown = new StringSelectMenuBuilder()
            .setCustomId('equipmenu')
            .setPlaceholder('Choose the slot to equip this weapon in.')
            .setOptions([ new StringSelectMenuOptionBuilder()
                .setLabel('Slot 1')
                .setValue('1'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Slot 2')
                .setValue('2'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Slot 3')
                .setValue('3'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Slot 4')
                .setValue('4')
            ])
        const slotRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .setComponents(slotDropdown)
        const dropdownRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .setComponents(dropdown)
        let response = await interaction.reply({embeds:[embed],components:[actionRow]})
        let index = 0;

        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });
    
        let reforgetier = 'white'
        let curSlot = 0
        collector.on('collect', async i => {
            let curWeapon = profileData.weaponstorage[index]
            let weaponInfo = weapons[curWeapon.weaponid as keyof typeof weapons]
            if(i.customId === 'wstoreup') {
                index--;
                downButton.setDisabled(false)
                if(index == 0) {
                    upButton.setDisabled(true)
                }
                embed.setFields(buildEntries(index,profileData.weaponstorage))
                response.edit({embeds:[embed],components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'wstoredown') {
                index++;
                upButton.setDisabled(false)
                if(index == profileData.weaponstorage.length-1) {
                    downButton.setDisabled(true)
                }
                embed.setFields(buildEntries(index,profileData.weaponstorage))
                response.edit({embeds:[embed],components:[actionRow]})
                i.deferUpdate()
             }else if (i.customId === 'wstoreselect') {
                const weaponEmbed = buildEmbed(weaponInfo,curWeapon.grade,interaction.client)
                actionRow.setComponents(backButton,forgeButton,equipButton)
                response.edit({embeds:[weaponEmbed],components:[actionRow,dropdownRow,slotRow]})
                i.deferUpdate()
            } else if (i.customId === 'wstoreback') {
                actionRow.setComponents(upButton,selectButton,downButton) 
                response.edit({embeds:[embed],components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'wstoreforge') {
                if(profileData.items[`${reforgetier}core`] == 0) {
                    i.reply({content:`You don't have any of this core.`, ephemeral:true})
                    return;
                }
                const core = items[`${reforgetier}core` as keyof typeof items]
                const rolled = rollWeapon(core)
                try {
                    profileData = await UserModel.findOneAndUpdate({
                        userid: interaction.user.id
                    }, {
                        $inc: {[`items.${reforgetier}core`]:-1},
                        $set: {[`weaponstorage.${index}.grade`]:rolled+1}
                    }, {new: true});
                } catch(e) {
                    console.log(e)
                    i.reply({content:`An error occured, please try again`, ephemeral:true})
                    return;
                }
                const weaponEmbed = buildEmbed(weaponInfo,rolled+1,interaction.client)
                response.edit({embeds:[weaponEmbed]})
                i.reply({content:`Your weapon was reforged to ${tierToName(rolled)}`})
            } else if (i.customId === 'wstoreequip') {
                if(curSlot == 0) {
                    i.reply({content:'No Slot Chosen',ephemeral:true})
                    return;
                }
                try {
                    let equippedWeapon = profileData.weapons[curSlot-1] 
                    profileData = await UserModel.findOneAndUpdate({
                        userid: interaction.user.id
                    }, {
                        $set: {
                            [`weapons.${curSlot-1}.weaponid`]:curWeapon.weaponid,
                            [`weapons.${curSlot-1}.grade`]:curWeapon.grade,
                            [`weaponstorage.${index}.weaponid`]:equippedWeapon.weaponid,
                            [`weaponstorage.${index}.grade`]:equippedWeapon.grade,}
                    }, {new: true})
                    i.reply({content:`Equipped your ${weaponInfo.name} in slot ${curSlot}`,ephemeral:true})
                    embed.setFields(buildEntries(index,profileData.weaponstorage))
                    actionRow.setComponents(upButton,selectButton,downButton)
                    response.edit({embeds:[embed],components:[actionRow]})
                } catch(e) {
                    console.log(e)
                    interaction.reply({content:`An error has occured.`,ephemeral:true})
                    return;
                }
            }
        })

        const dropdownCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000, filter });
    
        dropdownCollector.on('collect', async i => {
            if(i.customId === 'reforgegrade') {
                reforgetier = i.values.join(', ')
                i.deferUpdate()
            } else if(i.customId === 'equipmenu') {
                curSlot = parseInt(i.values.join(', '))
                i.deferUpdate()
            }
        }) 
    }
}

function buildEntries(indexNum: number, weaponArray: any) {
    let fields:any = []
    for(let i = 0; i < weaponArray.length; i++) {  
        let weaponInfo = weapons[weaponArray[i].weaponid as keyof typeof weapons]
        let name = `${weaponInfo.name}`
        if(i == indexNum) {
            name = `🟢 ${weaponInfo.name}`
        }
        fields.push({name:name,value:`Tier: ${tierToName(weaponArray[i].grade-1)}`})
    }
    return fields
}

function buildEmbed(weapon: any,tier:number, client: Client) {
        let statText = `Targets: `
        if(weapon.attacksenemies) {
            statText+='Enemies\n'
        } else {
            statText+= 'Allies\n'
        }
        
        statText+=`Health: ${weapon.health*weaponQualityMod(tier)}\nDefense: ${weapon.defense}\nDamage: ${weapon.damage*weaponQualityMod(tier)}\nMax Targets: ${weapon.maxTargets}\nAttacks Per Turn: ${weapon.apt*weaponQualityMod(tier)}\nBehavior: `
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
            .setFields([ {
                    name:'Stats',
                    value:statText
                }
            ])
            return embed
}

function rollWeapon(core:any) {
    const rand = Math.random()
    const raritytable = [
        [.8,1,1,1,1,1],
        [.6,.9,1,1,1,1],
        [.5,.8,.95,1,1,1],
        [.45,.75,.9,.97,1,1],
        [.44,.75,.89,96,.99,1]
    ]

    let rarity =  raritytable[core.rarity]
    let i = 0;
    for(let num of rarity) {
        if(rand < num) {
            return i;
        }
        i++
    }
    return 0
}