import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from "../../../data/items.json";
const UserModel = require('../../utils/schema')
const tierToName = require('../../utils/tierToname')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reforge')
		.setDescription('Reforge a weapon')
        .addIntegerOption((option)=>
            option.setName('slot').setDescription('The weapon that you want to reforge')
            .setRequired(true).setMinValue(1).setMaxValue(4)
        ).addStringOption((option) => 
            option.setName('tier').setDescription('The tier of core you want to use')
            .setRequired(true)
        ),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const slot = interaction.options.getInteger('slot')!
        const weapon = profileData.weapons[slot-1]
        const weaponData = weapons[weapon.weaponid as keyof typeof weapons]
        const coreid = `${interaction.options.getString('tier')!.toLocaleLowerCase()}core`
        const core = items[coreid as keyof typeof items]
        
        if(!weapon) {
            interaction.reply({content:`The weapon was not found.`,ephemeral:true})
            return;
        } else if(!core) {
            interaction.reply({content:`The core tier ${coreid} was not found`,ephemeral:true})
            return;
        } else if(profileData.items[coreid] < 1) {
            interaction.reply({content:`You do not have the required core`,ephemeral:true})
            return;
        }
        
        const rolled = rollWeapon(core)
        try {
            const response2 = await UserModel.findOneAndUpdate({
                userid: interaction.user.id
            }, {
                $inc: {[`items.${coreid}`]:-1},
                $set: {[`weapons.${slot-1}.grade`]:rolled+1}
            });
        } catch(e) {
            console.log(e)
            interaction.reply({content:`An error occured, please try again`, ephemeral:true})
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0xbf3115)
            .setTitle(`Your ${weaponData.name} was Reforged to ${tierToName(rolled)}`)
        interaction.reply({embeds:[embed]})
    }
}

function rollWeapon(core:any) {
    const rand = Math.random()
    const raritytable = [
        [.8,1,1,1,1,1],
        [.6,.9,1,1,1,1],
        [.5,.8,.95,1,1,1],
        [.45,.75,.9,.97,1,1],
        [.44,.75,.89,96,.99,1]
    ]

    let rarity =  raritytable[core.rarity]
    let i = 0;
    for(let num of rarity) {
        if(rand < num) {
            return i;
        }
        i++
    }
    return 0
}