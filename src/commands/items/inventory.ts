import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import items from '../../../data/items.json'
module.exports = {
    embed: new EmbedBuilder()
    .setTitle('inventory')
    .setDescription('All the items you have in your inventory.'),
	data: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Look at all your items'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        let embeds: EmbedBuilder[] = []
        for(let i = 0; i < 6; i++) {
            let embed = new EmbedBuilder()
            .setTitle('Inventory')
            .setColor(0x0565ff)
            .setDescription(`Items of rarity ${i}`)
            embeds.push(embed)
        }
        for(let [key,value] of Object.entries(items)) {
            embeds[value.rarity].addFields( {
                name:`${value.name} ${interaction.client.emojis.cache.get(value.emoji)}`,
                value:`${profileData.items[key]}`
            })
        }

        let prevbutton = new ButtonBuilder()
            .setCustomId('previnv')
            .setLabel('<-')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        let nextbutton = new ButtonBuilder()
            .setCustomId('nextinv')
            .setLabel('->')
            .setStyle(ButtonStyle.Primary)

        let actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(prevbutton,nextbutton)

		let response = await interaction.reply({embeds:[embeds[0]],components:[actionRow]});

        let index = 0;

        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });

        collector.on('collect', async i => {
            if(i.customId === 'previnv') {
                index--;
                if(index == 0) {
                    prevbutton.setDisabled(true)
                }

                nextbutton.setDisabled(false)

                actionRow.setComponents(prevbutton,nextbutton)
                response.edit({embeds:[embeds[index]],components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'nextinv') {
                index++;
                if(index == 5) {
                    nextbutton.setDisabled(true)
                }

                prevbutton.setDisabled(false)

                actionRow.setComponents(prevbutton,nextbutton)
                response.edit({embeds:[embeds[index]],components:[actionRow]})
                i.deferUpdate()
            }
        })
	},
};