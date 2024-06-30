import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import {drones} from '../../../data/drones.json'

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('buydrone')
    .setDescription('Buy a new drone. The price of each drone increases by 100x each purchase.'),
	data: new SlashCommandBuilder()
		.setName('buydrone')
		.setDescription('Buy a new drone!'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {

        //Check if the user has the required amount of money to buy a new drone.
        if (profileData.balance < 100**(profileData.drones.length+1)) {
            interaction.reply({content:`You don't have $${100**(profileData.drones.length+1)} to buy another drone. ${interaction.client.emojis.cache.get(drones[profileData.drones.length-1].emoji)}`,ephemeral:true})
            return;
        }


		const embed = new EmbedBuilder()
            .setTitle(`Are you sure you would like to buy a new drone? ${interaction.client.emojis.cache.get(drones[profileData.drones.length-1].emoji)}`)
            .setDescription(`Cost: $${100**(profileData.drones.length+1)}`)
            .setColor(0x3ea5b3)

        const submit = new ButtonBuilder()
            .setCustomId('buydrone')
            .setLabel('Buy')
            .setStyle(ButtonStyle.Success)

        const actionrow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(submit)

        const response = await interaction.reply({embeds:[embed],components:[actionrow]})

        const filter = (i: any) => i.user.id == interaction.user.id

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });
    
        //When the button is clicked send the changes to the database and edit the reply.
        collector.once('collect', async i => {
            if(i.customId === 'buydrone') {
                try {
                    const res = await UserModel.findOneAndUpdate({
                        userid: interaction.user.id
                    }, {
                        $push: {drones:{}},
                        $inc: {balance:-(100**(profileData.drones.length+1))}
                    });
                    embed.setTitle(`Drone Bought! ${interaction.client.emojis.cache.get(drones[profileData.drones.length-1].emoji)}`).setColor(0x00FF00)
                } catch(e) {
                    console.log(e)
                    i.reply({content:`An error occured! Please try again`,ephemeral:true})
                }
                response.edit({embeds:[embed],components:[]})
            }
        })
	},
};