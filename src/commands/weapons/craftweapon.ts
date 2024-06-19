import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from '../../../data/items.json'
const UserModel = require('../../utils/schema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('craftweapon')
		.setDescription('Craft a new weapon')
        .addStringOption((option) => option.setName('weapon').setDescription('The name of the weapon you want to craft')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const weaponid = interaction.options.getString('weapon')!.toLowerCase().replace(/\s/g, '');
        const weaponInfo = weapons[weaponid as keyof typeof weapons]
        if(!weaponInfo) {
            interaction.reply({content:`The weapon ${weaponid} doesnt seem to exit`,ephemeral:true})
            return;
        }
        const ingredients = weaponInfo.ingredients
        let text = `Please confirm that you want to spend:`
        let data : any = {}
        for(let [key,obj] of Object.entries(ingredients)) {
            let item = items[key as keyof typeof items]
            if(profileData.items[key] < obj) {
                interaction.reply({content:`You don't have enough ${item.name} to craft this weapon.`,ephemeral:true})
                return;
            }
            text+=`\n${obj} x ${interaction.client.emojis.cache.get(item.emoji)} ${item.name}`
            data[`items.${key}`] = -obj
        }
        const embed = new EmbedBuilder()
            .setTitle(`Are You Sure You Want to Craft a ${weaponInfo.name}?`)
            .setDescription(text)
            .setColor(0xFFA500)
        const button = new ButtonBuilder()
            .setCustomId(`craftweapon`)
            .setLabel(`Confirm`)
            .setStyle(ButtonStyle.Success)
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(button)
        
        const response = await interaction.reply({embeds:[embed],components:[actionRow]})
        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });

        collector.once('collect', async i => {
            if(i.customId==='craftweapon') {
                try {
                    const mongoResponse = await UserModel.findOneAndUpdate({
                        userid: response.interaction.user.id
                    }, {
                        $inc: data,
                        $push: {
                            weaponstorage:{weaponid:weaponid}
                        }
                    });
                    embed.setFooter({text:'Weapon Crafted'}).setColor(0x00FF00)
                } catch(e) {
                    console.log(e)
                    i.reply(`An error occured. Please try again.`)
                }
                button.setDisabled(true)
                actionRow.setComponents(button)
                response.edit({embeds:[embed],components:[actionRow]})
                i.deferUpdate()
            }
        })
    }
}