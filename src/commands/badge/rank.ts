import { time, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import mongoose from "mongoose";

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('rank')
    .setDescription('Check the info for your current rank.'),
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Check which rank you have!'),
	async execute(interaction: CommandInteraction, profileData: any) {
        const embed = new EmbedBuilder()
            .setColor(tierToHex(profileData.badgetier))
            .setTitle(`You are ${tierToColor(profileData.badgetier)} rank!`)
            .setDescription(`Obtained at ${time(profileData.badgedate)}.`)
            .addFields(
                {name:"Stat Changes:", value:"Unlock new pets!\nHigher Work Wage!\nMore Difficult encounters"}
            )
            .setThumbnail('https://png.pngtree.com/png-vector/20230116/ourmid/pngtree-3d-star-badge-clipart-png-image_6564314.png')
		interaction.reply({embeds:[embed]});
	},
};

function tierToColor(tier:number) {
    if(tier == 0) {
        return "white"
    }else if(tier == 1) {
        return "green"
    } else if (tier == 2) {
        return "blue"
    } else if (tier == 3) {
        return "purple"
    } else if (tier == 4) {
        return "red"
    } else if (tier == 5) {
        return "orange"
    }
    return "gold"
}

function tierToHex(tier:number) {
    if(tier == 0) {
        return 0xF0F0F0
    }else if(tier == 1) {
        return 0x41c219
    } else if (tier == 2) {
        return 0x45a2d1
    } else if (tier == 3) {
        return 0xa13ae0
    } else if (tier == 4) {
        return 0xc7144a
    } else if (tier == 5) {
        return 0xf5870a
    }
    return 0xf2ca16
    
}