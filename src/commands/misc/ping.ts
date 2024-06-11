import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction: CommandInteraction, profileData: mongoose.Document) {
		return {text:`Pong! Latency is ${Date.now() - interaction.createdTimestamp}ms`};
	},
};