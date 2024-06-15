import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weaponlist')
		.setDescription('View all available weapons.'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const embed = new EmbedBuilder()
            .setTitle(`Weapons`)
            .setColor(0xbf3115)
        for(let [key,value] of Object.entries(weapons)) {
            let text = ``
            if(value.attacksenemies) {
                text+=`Attacks up to ${value.maxTargets} enemies for ${value.damage} health.\nID: ${key}`
            } else {
                text+=`Heals up to ${value.maxTargets} allies for ${-value.damage} health.\nID: ${key}`
            }
            embed.addFields([
                {name:`${value.name}`,value:text}
            ])
        }

        interaction.reply({embeds:[embed]})
	},
};