import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
import * as upgrades from '../../../data/droneupgrades.json'
const UserModel = require('../../utils/schema')
import * as items from '../../../data/items.json'
import drones from '../../../data/drones.json'

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('upgradedrone')
    .setDescription('Choose a specific drone to upgrade using your items.')
    .setFields([{name:'[Drone]',value:'The index of the drone you want to upgrade.'}]),
    cooldown:30,
	data: new SlashCommandBuilder()
		.setName('upgradedrone')
		.setDescription('Upgrade one of the drone')
        .addIntegerOption((option) => option.setName('drone').setDescription('The bot you want to upgrade')
            .setMinValue(1).setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const botNum = interaction.options.getInteger('drone')!;
        if(botNum > profileData.drones.length) {
            interaction.reply({content:`You don't have that many bots!`,ephemeral:true})
            return;
        }
        let drone = profileData.drones[botNum-1]
		const response = await interaction.reply(buildEmbed(drone,botNum, interaction));

        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });

        collector.on('collect', async i => {
            if(i.customId === 'speed' || i.customId === 'amount' || i.customId === 'quality' || i.customId === 'variety') {
                let type = i.customId;
                if(type === 'variety') {
                    type = 'travel'
                }
                let tier = drone[type];
                if(type === 'amount') {
                    tier-=9;
                }

                if(upgrades[type as keyof typeof upgrades][tier].amount > profileData.items[upgrades[type as keyof typeof upgrades][tier].item]) {
                    await i.reply({content:`You do not have enough materials to upgrade ${type}`,ephemeral:true})
                    return;
                }
                
                profileData = await UserModel.findOneAndUpdate({
                    userid: interaction.user.id
                }, {
                    $inc: {[`drones.${botNum-1}.${type}`]:1,
                        [`items.${upgrades[type as keyof typeof upgrades][tier].item}`]:-upgrades[type as keyof typeof upgrades][tier].amount}
                },{
                    new:true
                });

                await response.edit(buildEmbed(profileData.drones[botNum-1],botNum, interaction))
                drone = profileData.drones[botNum-1]

                await i.reply({content:`You spent ${upgrades[type as keyof typeof upgrades][tier].amount} ${upgrades[type as keyof typeof upgrades][tier].item} to upgrade ${type}`,ephemeral:true})
            }
        });
	},
};

function buildEmbed(drone: any, botNum: number, interaction:ChatInputCommandInteraction) {
    const upgradeSpeed = new ButtonBuilder()
            .setCustomId('speed')
            .setLabel('Speed')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        const upgradeAmount = new ButtonBuilder()
            .setCustomId('amount')
            .setLabel('Amount')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        const upgradeQuality = new ButtonBuilder()
            .setCustomId('quality')
            .setLabel('Quality')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
    
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(upgradeSpeed,upgradeAmount,upgradeQuality);

            let embed = new EmbedBuilder()
            .setTitle(`Upgrade Drone ${botNum}`)
            .setColor(0x3ea5b3)
            .setDescription(`See the next upgrades for ${interaction.client.emojis.cache.get(drones.drones[botNum-1].emoji)}`)
        let speedVal = 'Max'
        if(drone.speed < upgrades.speed.length) {
            upgradeSpeed.setDisabled(false);
            let itemInfo = items[upgrades.speed[drone.speed].item as keyof typeof items]
            speedVal = `${Math.round((2/(drone.speed+1))*drone.amount*100)/100} minutes: ${upgrades.speed[drone.speed].amount}x${interaction.client.emojis.cache.get(itemInfo.emoji)} ${itemInfo.name}`
        }
        let amountVal = 'Max'
        if(drone.amount-9 < upgrades.amount.length) {
            upgradeAmount.setDisabled(false);
            let itemInfo = items[upgrades.amount[drone.amount-9].item as keyof typeof items]
            amountVal = `${drone.amount+1} items: ${upgrades.amount[drone.amount-9].amount}x${interaction.client.emojis.cache.get(itemInfo.emoji)} ${itemInfo.name}`
        }
        let qualityVal = 'Max'
        if(drone.quality < upgrades.quality.length) {
            upgradeQuality.setDisabled(false);
            let itemInfo = items[upgrades.quality[drone.quality].item as keyof typeof items]
            qualityVal = `${drone.quality+1} items: ${upgrades.quality[drone.quality].amount}x${interaction.client.emojis.cache.get(itemInfo.emoji)} ${itemInfo.name}`
        }

        if(drone.working) {
            upgradeAmount.setDisabled(true);
            upgradeQuality.setDisabled(true);
            upgradeSpeed.setDisabled(true);
            embed.setTitle(`Upgrade Drone ${botNum} (WORKING)`)
        }
        embed.addFields([
            {name:`Speed💨: ${Math.round((2/drone.speed)*drone.amount*100)/100} minutes`,
            value:speedVal},
            {name:`Amount💼: ${drone.amount}`,
            value:amountVal},
            {name:`Quality🌟: ${drone.quality}`,
            value:qualityVal}
        ])
        
		return {embeds:[embed],components:[actionRow]};
}