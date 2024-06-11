import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Shows your balance!'),
	async execute(interaction: CommandInteraction, profileData: any) {
		return `Wow! your balance is ${profileData.balance}`;
	},
};