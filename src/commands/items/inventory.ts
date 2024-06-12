import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as items from '../../../data/items.json'
module.exports = {
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Look at all your items'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
		let embed = new EmbedBuilder()
            .setTitle('inventory')
            .setColor(0x0565ff)
            .setDescription('A list of all your items.')
        for(let [key,value] of Object.entries(items)) {
            if(value.rarity <= profileData.badgetier) {
                embed.addFields( {
                    name:`${value.name} ${value.emoji}`,
                    value:`${profileData.items[key]}`
                })
            }
        }
    

		return {text:``,embeds:[embed]};
	},
};