import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('pay')
    .setDescription('Pay a given user some money.')
    .setFields([{name:'[User]',value:'The user you want to give money to them.'},
        {name:'[amount]',value:'The amount of money you would like to give the user.'}
    ]),
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
            interaction.reply({content:"You do not have the balance to pay this much.",ephemeral:true})
            return;
        }
        try{
            const recData = await UserModel.findOne({userid:recipient.id});
            if(!recData) {
                interaction.reply({content:"This user has not used this bot and does not have a profile.",ephemeral:true})
                return;
            } 
        } catch (e) {
            console.log(e)
            interaction.reply({content:"An error occured. please try again.",ephemeral:true})
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