import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('buydrone')
		.setDescription('Buy a new drone!'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {

        if (profileData.balance < 100**(profileData.drones.length+1)) {
            interaction.reply(`You don't have $${100**(profileData.drones.length+1)} to buy another drone.`)
            return;
        }


		const embed = new EmbedBuilder()
            .setTitle(`Are you sure you would like to buy a new drone? 🤖`)
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
    
        collector.on('collect', async i => {
            if(i.customId === 'buydrone') {
                const res = await UserModel.findOneAndUpdate({
                    userid: interaction.user.id
                }, {
                    $push: {drones:{}},
                    $inc: {balance:-(100**(profileData.drones.length+1))}
                });
                embed.setTitle('Drone Bought! 🤖')
                response.edit({embeds:[embed],components:[]})
            }
        })
	},
};