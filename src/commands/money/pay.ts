import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pay')
		.setDescription('Pay a user.')
        .addUserOption((option:SlashCommandUserOption) => option.setName('user')
            .setDescription('The user who you wish to give money to')
            .setRequired(true))
        .addIntegerOption((option:SlashCommandIntegerOption) => option.setName('amount')
            .setDescription('The amount of money you wish to pay')
            .setRequired(true)
            .setMinValue(1)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const options = interaction.options;
        const recipient = options.getUser('user')!;
        const amount = options.getInteger('amount')!;
        if(profileData.balance < amount) {
            interaction.reply("You do not have the balance to pay this much.")
            return;
        }
        try{
            const recData = await UserModel.findOne({userid:recipient.id});
            if(!recData) {
                interaction.reply("This user has not used this bot and does not have a profile.")
                return;
            } 
        } catch (e) {
            console.log(e)
            interaction.reply("An error occured. please try again.")
            return;
        }

        const response1 = await UserModel.findOneAndUpdate({
            userid: interaction.user.id
        }, {
            $inc: {balance:-amount}
        });


        const response2 = await UserModel.findOneAndUpdate({
            userid: recipient.id
        }, {
            $inc: {balance:amount}
        });

		interaction.reply(`You paid $${amount} to ${recipient}, your remaining balance is ${profileData.balance-amount}`);
	},
};