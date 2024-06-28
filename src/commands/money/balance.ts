import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')

module.exports = {
	embed: new EmbedBuilder()
    .setTitle('balance')
    .setDescription('Check the amount of money a user has')
    .setFields([{name:'{User}',value:'The user to check the balance of. Default yourself'}]),
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Shows your balance!')
		.addUserOption((option:SlashCommandUserOption) => option
		.setName('user').setDescription('the user you want to check the balance of')),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
		const options = interaction.options;
        const user = options.getUser('user');
		if(user) {
			try{
				const recData = await UserModel.findOne({userid:user.id});
				if(!recData) {
					interaction.reply({content:"This user has not used this bot and does not have a profile.",ephemeral:true})
					return;
				} else {
					interaction.reply({content:`${user}'s balance is $${recData.balance}`,ephemeral:true})
					return;
				} 
			} catch (e) {
				console.log(e)
				interaction.reply({content:"An error occured. please try again.",ephemeral:true})
				return;
			}
		}

		interaction.reply(`Wow! your balance is $${profileData.balance}`);
	},
};