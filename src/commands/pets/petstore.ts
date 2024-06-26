import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as pets from '../../../data/pets.json'
module.exports = {
    cooldown:60,
	data: new SlashCommandBuilder()
		.setName('petstore')
		.setDescription('Look at all the pets to buy!'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
		let embed = new EmbedBuilder()
            .setTitle('Pet Store')
            .setColor(0x0565ff)
            .setDescription('A list of all the animals you can buy. Be careful, buying a new pet will replace your old one.')
        let petArray = [];
        for(var obj of pets.pets) {
            petArray.push( {
                name:`${obj.name} ${interaction.client.emojis.cache.get(obj.icon)}: $${obj.cost}`,
                value:`${obj.description} Tier: ${obj.badge}`
            })
        }

        let page = 0;
        for(let i = 0; i < petArray.length/2; i++) {
            embed.addFields(petArray[i])
        }
    
        let button = new ButtonBuilder()
            .setCustomId('flipstore')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)

        let actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(button)
		const response = await interaction.reply({embeds:[embed], components:[actionRow]});
        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });
        
        collector.on('collect', async i => {
            if(i.customId === 'flipstore') {
                if(page == 1) {
                    page = 0;
                    embed.setFields()
                    for(let i = 0; i < petArray.length/2; i++) {
                        embed.addFields(petArray[i])
                    }
                    response.edit({embeds:[embed], components:[actionRow]})
                } else {
                    page = 1;
                    embed.setFields()
                    for(let i = Math.floor(petArray.length/2); i < petArray.length; i++) {
                        embed.addFields(petArray[i])
                    }
                    response.edit({embeds:[embed], components:[actionRow]})
                }
                i.deferUpdate()
            }
        })
	},
};