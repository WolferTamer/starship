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
					interaction.reply("This user has not used this bot and does not have a profile.")
					return;
				} else {
					interaction.reply(`${user}'s balance is $${recData.balance}`)
					return;
				} 
			} catch (e) {
				console.log(e)
				interaction.reply("An error occured. please try again.")
				return;
			}
		}

		interaction.reply(`Wow! your balance is $${profileData.balance}`);
	},
};