import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
import {weapons} from '../../../data/weapons.json'
import items from "../../../data/items.json";

module.exports = {
	data: new SlashCommandBuilder()
		.setName('weapon')
		.setDescription('View the stats of a specific weapon')
        .addStringOption((option)=>
            option.setName('weapon').setDescription('The weapon whose info you want to view')
            .setRequired(true)
        ),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const weaponid = interaction.options.getString('weapon')!.toLowerCase().replace(/\s/g, '');
        const weapon = weapons[weaponid as keyof typeof weapons]
        if(!weapon) {
            interaction.reply({content:`The weapon was not found.`,ephemeral:true})
            return;
        }
        let ingredientText = ``
        for(let [key,obj] of Object.entries(weapon.ingredients)) {
            ingredientText+=`${obj} x ${interaction.client.emojis.cache.get(items[key as keyof typeof items].emoji)} ${items[key as keyof typeof items].name}\n`
        }
        let statText = `Targets: `
        if(weapon.attacksenemies) {
            statText+='Enemies\n'
        } else {
            statText+= 'Allies\n'
        }
        statText+=`Damage: ${weapon.damage}\nMax Targets: ${weapon.maxTargets}\nBehavior: `
        if(weapon.behavior === 'lowesthealth') {
            statText+=`Attacks targets with lowest health`
        } else if(weapon.behavior === 'highesthealth') {
            statText+=`Attacks targets with highest health`
        } else if(weapon.behavior === 'lowestdefense') {
            statText+=`Attacks targets with lowest armor`
        } else if(weapon.behavior === 'highestdefense') {
            statText+=`Attacks targets with highest armor`
        }

        const embed = new EmbedBuilder()
            .setTitle(weapon.name)
            .setColor(0xbf3115)
            .setFields([
                {
                    name:'Ingredients',
                    value:ingredientText
                }, {
                    name:'Stats',
                    value:statText
                }
            ])
            .setFooter({text:`ID: ${weaponid}`})

        interaction.reply({embeds:[embed]})
	},
};