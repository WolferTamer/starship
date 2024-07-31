import { time, CommandInteraction, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, StringSelectMenuInteraction } from "discord.js";
import mongoose from "mongoose";
const tierToName = require('../../utils/tierToname')
const UserModel = require('../../utils/schema')

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('rank')
    .setDescription('Check the info for your current rank.'),
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('Check which rank you have!'),
    cooldown: 60,
	async execute(interaction: CommandInteraction, profileData: any) {
        const embed = new EmbedBuilder()
            .setColor(tierToHex(profileData.badgetier))
            .setTitle(`You are ${tierToColor(profileData.badgetier)} rank!`)
            .setDescription(`Obtained at ${time(profileData.badgedate)}.`)
            .addFields(
                {name:"Stat Changes:", value:"Unlock new pets!\nHigher Work Wage!\nMore Difficult encounters"}
            )
            .setThumbnail('https://png.pngtree.com/png-vector/20230116/ourmid/pngtree-3d-star-badge-clipart-png-image_6564314.png')
            .setFooter({text:'Choose which rank to use below.'})
        const selectmenu = new StringSelectMenuBuilder()
            .setCustomId('rankselect')
            .setPlaceholder('rank')
        for(let i = 0; i <= profileData.badgetier; i++) {
            const option = new StringSelectMenuOptionBuilder()
                .setLabel(tierToName(i))
                .setValue(`${i}`)
            if(i == profileData.chosenbadge) {
                option.setDefault(true)
            }
            selectmenu.addOptions([option])
        }
        const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .setComponents([selectmenu])
		let response = await interaction.reply({embeds:[embed],components:[actionRow]});

        const filter = (i: any) => i.user.id == interaction.user.id
        const dropdownCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 60_000, filter });
        dropdownCollector.on('collect', async (i : StringSelectMenuInteraction) => {
            if(i.customId === 'rankselect') {
                const chosenTier = +i.values[0]
                try {
                    const send = await UserModel.findOneAndUpdate({
                        userid:interaction.user.id
                    },{
                        $set: {
                            chosenbadge:chosenTier
                        }
                    })
                    i.reply({content:`Set your rank to ${tierToName(chosenTier)}`,ephemeral:true})
                } catch(e) {
                    console.log(e)
                    i.reply({content:`An error occured when chosing your rank`,ephemeral:true})
                }
            }
        })
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