import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'
const tierToName = require('../../utils/tierToname')
const UserModel = require('../../utils/schema')

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('weaponstorage')
    .setDescription('A list of all the weapons you have crafted.'),
	data: new SlashCommandBuilder()
		.setName('weaponstorage')
		.setDescription('View the weapons you have crafted'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const embed = new EmbedBuilder()
            .setTitle(`Your Weapons`)
            .setColor(0xbf3115)
            let i = 0
        for(let obj of profileData.weaponstorage) {
            let weapon = weapons[obj.weaponid as keyof typeof weapons]
            embed.addFields([{name:`${i+1}. ${weapon.name}`,value:`Tier: ${tierToName(obj.grade-1)}`}])
            i++
        }
        interaction.reply({embeds:[embed]})
    }
}