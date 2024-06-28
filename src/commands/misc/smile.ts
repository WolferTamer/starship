import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";

module.exports = {
	embed: new EmbedBuilder()
    .setTitle('smile')
    .setDescription('Sends a smile image.'),
	data: new SlashCommandBuilder()
		.setName('smile')
		.setDescription('Draws a smiley face!'),
	async execute(interaction: CommandInteraction, profileData: any) {
        const embed = new EmbedBuilder()
        .setColor(0xFFFFFF)
        .setTitle("A Smile!")
        .setImage('https://i.pinimg.com/564x/6a/ba/8b/6aba8b5c288c728568945c53625eba87.jpg')
		interaction.reply({embeds:[embed]});
	},
};