import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as pets from '../../../data/pets.json'
module.exports = {
	data: new SlashCommandBuilder()
		.setName('petstore')
		.setDescription('Look at all the pets to buy!'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
		let embed = new EmbedBuilder()
            .setTitle('Pet Store')
            .setColor(0x0565ff)
            .setDescription('A list of all the animals you can buy. Be careful, buying a new pet will replace your old one.')
        for(var obj of pets.pets) {
            if(obj.badge <= profileData.badgetier) {
                embed.addFields( {
                    name:`${obj.name} ${obj.icon}: $${obj.cost}`,
                    value:obj.description
                })
            }
        }
    

		interaction.reply({embeds:[embed]});
	},
};