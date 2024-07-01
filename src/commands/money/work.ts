import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
const UserModel = require('../../utils/schema');

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('work')
    .setDescription('Earn a random amount of money based on your rank.'),
    cooldown:10,
	data: new SlashCommandBuilder()
		.setName('work')
		.setDescription('Earn a random amount of money based on your rank.'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const rand = Math.floor(Math.random()*10*(2**profileData.badgetier))+1;

        if(rand > 0) {
            const response = await UserModel.findOneAndUpdate({
                userid: interaction.user.id
            }, {
                $inc: {balance:rand}
            });
        }
        
		interaction.reply(`You earned $${rand} from working!`);
	},
};