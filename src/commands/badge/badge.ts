import { time, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('badge')
		.setDescription('Check which badge you have!'),
	async execute(interaction: CommandInteraction, profileData: any) {
        
		return {text:`You currently have a ${tierToColor(profileData.badgetier)} badge that you got on ${time(profileData.badgedate)}`};
	},
};

function tierToColor(tier:number) {
    if(tier == 0) {
        return "white"
    }else if(tier == 1) {
        return "green"
    } else if (tier == 2) {
        return "blue"
    }
}