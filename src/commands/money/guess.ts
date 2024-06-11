import { ChatInputCommandInteraction, CommandInteraction, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
import mongoose from "mongoose";
const UserModel = require('../../utils/schema');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guess')
		.setDescription('guess a number for the chance to win money!')
        .addIntegerOption((option:SlashCommandIntegerOption) =>
            option.setName('number').setDescription('The number between 1-10 you want to guess')
        .setMinValue(1).setMaxValue(10).setRequired(true)
        ),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const rand = Math.round(Math.random()*10);
        const options = interaction.options;
        const guess = options.getInteger('number')!;
        if(profileData.balance < 50) {
            return "I'm sorry, you need $50 or more to play"
        }
        let balChange = 0;
        let text = '';
        if(guess == rand) {
            balChange=100;
            text = `Your guess of ${guess} was exactly right! You earned $100!`
        }else if (Math.abs(guess-rand) <=2){
            text = `Your guess of ${guess} was 2 or less away from ${rand}, so you won't lose any money.`
        } else {
            balChange = -50;
            text = `Your guess of ${guess} was more than 2 away from ${rand}, you lost $50`
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
        
		return {text:text};
	},
};