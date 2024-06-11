import { CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption } from "discord.js";
import mongoose from "mongoose";
const UserModel = require('../../utils/schema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rollbage')
		.setDescription('Spend money to roll for a new badge')
        .addIntegerOption((option: SlashCommandIntegerOption) => option.setMinValue(0)
        .setRequired(false).setName('amount')
        .setDescription('The amount you want to spend. The higher amount, the better your chances')),
	async execute(interaction: CommandInteraction, profileData: any) {
        let data : any= {}
        if(!profileData.badgetier) {
            data["badgetier"] = 0;
        }
        if(!profileData.badgedate) {
            data["badgedate"] = Date.now
        }
        if(Object.keys(data).length > 0) {
            const response = UserModel.findOneAndUpdate({
                userid:interaction.user.id
            },{
                $set: data
            })
        }

        profileData = await UserModel.findOne({userid:interaction.user.id});

        const rand = Math.random();
        let text = ""
        if(rand < .8) {
            if(profileData.badgetier<1) {
                text = `${interaction.user} got a green badge! They now get special stuff probably!`
                updateBadge(interaction.user.id, 1)
            } else {
                text = `${interaction.user} got a green badge! Their current badge will be kept.`
            }
        } else {
            if(profileData.badgetier<2) {
                text = `${interaction.user} got a blue badge! They now get even more special stuff!`
                updateBadge(interaction.user.id, 2)
            } else {
                text = `${interaction.user} got a blue badge! Their current badge will be kept.`
            }
        }
        
		return {text:text};
	},
};

async function updateBadge(id:string, badge:number) {
    return await UserModel.findOneAndUpdate({
        userid:id
    },{
        $set: {
            badgetier:badge,
            badgedate:Date.now()
        }
    })
}