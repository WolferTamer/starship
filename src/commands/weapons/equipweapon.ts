import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, Embed, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from '../../../data/items.json'
const UserModel = require('../../utils/schema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('equipweapon')
		.setDescription('Equip a weapon in a certian slot.')
        .addIntegerOption((option) => option.setName('weapon').setDescription('The id of the weapon you want to craft.')
            .setRequired(true).setMinValue(1))
        .addIntegerOption((option) => option.setName('slot').setDescription(`The slot you want to replace`)
            .setRequired(true).setMinValue(1).setMaxValue(4)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const storageIndex = interaction.options.getInteger('weapon')!-1
        const slotIndex = interaction.options.getInteger('slot')!-1
        const equippedWeapon = profileData.weapons[slotIndex]
        const unequippedWeapon = profileData.weaponstorage[storageIndex]
        if(!unequippedWeapon) {
            interaction.reply({content:`You don't have any item in slot ${storageIndex+1}.`,ephemeral:true})
            return;
        }
        try {
            let response = await UserModel.findOneAndUpdate({
                userid: interaction.user.id
            }, {
                $set: {
                    [`weapons.${slotIndex}.weaponid`]:unequippedWeapon.weaponid,
                    [`weapons.${slotIndex}.grade`]:unequippedWeapon.grade,
                    [`weaponstorage.${storageIndex}.weaponid`]:equippedWeapon.weaponid,
                    [`weaponstorage.${storageIndex}.grade`]:equippedWeapon.grade,}
            })
        } catch(e) {
            console.log(e)
            interaction.reply({content:`An error has occured.`,ephemeral:true})
            return;
        }
        const oldWeapon = weapons[equippedWeapon.weaponid as keyof typeof weapons]
        const newWeapon = weapons[unequippedWeapon.weaponid as keyof typeof weapons]

        const embed = new EmbedBuilder()
            .setTitle(`Equipped Weapon in Slot ${slotIndex+1}`)
            .setDescription(`Your ${oldWeapon.name} as been swapped with a ${newWeapon.name}.`)
        interaction.reply({embeds:[embed]})
    }
}