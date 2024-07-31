import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import {embeds} from '../../../data/tutorial.json'
module.exports = {
    embed: new EmbedBuilder()
    .setTitle('tutorial')
    .setDescription('Go through the basics of the bot in the tutorial.'),
	data: new SlashCommandBuilder()
		.setName('tutorial')
		.setDescription('Get an explanation of the bot!'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        let pages: EmbedBuilder[] = []
        for(let info of embeds) {
            pages.push(new EmbedBuilder()
                .setTitle(info.title)
                .setDescription(info.description)
                .setFields(info.fields)
                .setColor(0x00FF00))
        }
        const nextButton = new ButtonBuilder()
            .setLabel('Next')
            .setCustomId('nexttutorial')
            .setStyle(ButtonStyle.Primary)
        const prevButton = new ButtonBuilder()
            .setLabel('Prev')
            .setCustomId('prevtutorial')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(prevButton,nextButton)
        let response = await interaction.reply({embeds:[pages[0]], components:[actionRow]})
        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 300_000, filter });
        let index = 0;
        collector.on("collect", async (i) => {
            if(i.customId === 'prevtutorial') {
                index--;
                if(index == 0) {
                    prevButton.setDisabled(true)
                }
                nextButton.setDisabled(false)
                response.edit({embeds:[pages[index]], components:[actionRow]})
                i.deferUpdate()
            } else if (i.customId === 'nexttutorial') {
                index++;
                if(index == pages.length-1) {
                    nextButton.setDisabled(true)
                }
                prevButton.setDisabled(false)
                response.edit({embeds:[pages[index]], components:[actionRow]})
                i.deferUpdate()
            }
        })
	},
};