import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
import mongoose from "mongoose";
const UserModel = require('../../utils/schema');

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('guess')
    .setDescription('Guess a number from 1-10 for the chance of winning money.')
    .setFields([{name:'[Number]',value:'The number you want to guess.'},
        {name:'{Amount}',value:'The amount of money you want to bet, default and minimum 50.'}
    ]),
	data: new SlashCommandBuilder()
		.setName('guess')
		.setDescription('guess a number for the chance to win money!')
        .addIntegerOption((option:SlashCommandIntegerOption) =>
            option.setName('number').setDescription('The number between 1-10 you want to guess')
        .setMinValue(1).setMaxValue(10).setRequired(true)
        ).addIntegerOption((option:SlashCommandIntegerOption) => option
            .setName('amount').setDescription('The amount of money you want to bet, minimum 50')
        .setMinValue(50).setMaxValue(100000).setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const rand = Math.floor(Math.random()*10)+1;
        const options = interaction.options;
        const guess = options.getInteger('number')!;
        const amount = options.getInteger('amount') ?? 50;

        if(profileData.balance < amount) {
            interaction.reply({content:"I'm sorry, you don't have enough to play with that amount.",ephemeral:true})
            return;
        }

        let balChange = 0;
        let text = '';

        //check which number is guessed and award based off of it.
        if(guess == rand) {
            balChange=amount*2;
            text = `Your guess of ${guess} was exactly right! You earned $${amount*2}`
        }else if (Math.abs(guess-rand) <=2){
            text = `Your guess of ${guess} was 2 or less away from ${rand}, so you won't lose any money.`
        } else {
            balChange = -amount;
            text = `Your guess of ${guess} was more than 2 away from ${rand}, you lost $${amount}`
        }

        if(balChange != 0) {
            let data : any = {}
            data["balance"] = balChange;
            const response = await UserModel.findOneAndUpdate({
                userid: interaction.user.id
            }, {
                $inc: {balance:balChange}
            });
        }
        
		interaction.reply(text);
	},
};