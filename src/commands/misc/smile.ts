import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('smile')
		.setDescription('Draws a smiley face!'),
	async execute(interaction: CommandInteraction, profileData: mongoose.Document) {
        const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle("A Smile!")
        .setImage('https://i.pinimg.com/564x/6a/ba/8b/6aba8b5c288c728568945c53625eba87.jpg')
		return {text:'',embeds:[embed]};
	},
};