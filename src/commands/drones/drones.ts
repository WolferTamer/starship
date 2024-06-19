import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import {drones} from '../../../data/drones.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drones')
		.setDescription('Look at all your drones'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
		let embed = new EmbedBuilder()
            .setTitle('Drones')
            .setColor(0x3ea5b3)
        let i = 1
        for(let drone of profileData.drones) {
            embed.addFields([
                {name:`${interaction.client.emojis.cache.get(drones[i-1].emoji)} Drone ${i} ${drone.working ? '(WORKING)':''}`,
                value:`- Speed: ${Math.round((2/drone.speed)*drone.amount*100)/100} minutes\n- Amount: ${drone.amount}\n- Quality: ${drone.quality}`}
            ])
            i++
        }
    
        embed.setFooter({text:`The cost of your next bot is ${100**(profileData.drones.length+1)}`})
		interaction.reply({embeds:[embed]});
	},
};