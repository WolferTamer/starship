import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')

module.exports = {
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
					return {text:"This user has not used this bot and does not have a profile."}
				} else {
					return {text:`${user}'s balance is $${recData.balance}`}
				} 
			} catch (e) {
				console.log(e)
				return {text:"An error occured. please try again."}
			}
		}

		return {text:`Wow! your balance is $${profileData.balance}`};
	},
};