import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";

module.exports = {
	embed: new EmbedBuilder()
    .setTitle('ping')
    .setDescription('Sends a ping to the bot that replies with the latency.'),
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: CommandInteraction, profileData: mongoose.Document) {
		interaction.reply(`Pong! Latency is ${Date.now() - interaction.createdTimestamp}ms`);
	},
};