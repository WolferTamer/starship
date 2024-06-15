import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder} from "discord.js";
const UserModel = require('../../utils/schema')
const rollItems = require('../../utils/rollItems')
import items from '../../../data/items.json'
import {drones} from '../../../data/drones.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('drone')
		.setDescription('Send your drone out to work')
        .addIntegerOption((option) => option.setName('drone').setDescription('The bot you want to check')
            .setMinValue(1).setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const botNum = interaction.options.getInteger('drone')!;
        if(botNum > profileData.drones.length) {
            interaction.reply({content:`You don't have that many bots!`,ephemeral:true})
            return;
        }
        const drone = profileData.drones[botNum-1]
        const workTime = (2/drone.speed)*drone.amount
        const embed = new EmbedBuilder()
            .setTitle(`Drone #${botNum} ${interaction.client.emojis.cache.get(drones[botNum-1].emoji)}`)
            .setColor(0x3ea5b3)
            .setDescription(`The info about this drone`)
        const startWork = new ButtonBuilder()
            .setCustomId('startwork')
            .setLabel('Start Working')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(false)
        if(drone.working) {
            if(Date.now()-drone.sent.getTime() >= workTime*60000) {
                let newItems = rollItems(drone)
                let stringVal = ''
                for(let [key,val] of Object.entries(newItems)) {
                    let item = items[key.split('.')[1] as keyof typeof items]
                    stringVal+=`${val} x ${interaction.client.emojis.cache.get(item.emoji)} ${item.name}\n`
                }
                embed.addFields([
                    {name:`Finished working for ${drone.amount} items`,value:stringVal}
                ])
                try {
                    const res = await UserModel.findOneAndUpdate({
                        userid: profileData.userid
                    }, {
                        $set: {[`drones.${botNum-1}.working`]:false},
                        $inc: newItems
                    });
                }catch(e){
                    console.log(e)
                    interaction.reply({content:`There was an error. Please try again`,ephemeral:true})
                    return
                }
            } else {
                embed.addFields([
                    {name:`Work Status:`,value:`${Math.round(((drone.sent.getTime()+(workTime*60000))-Date.now())/600)/100} minutes left`}
                ])
                startWork.setDisabled(true)
            }
        } else {
            embed.setDescription(`Remember to upgrade before working!`)
        }

        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(startWork);

        const response = await interaction.reply({embeds:[embed],components:[actionRow]})
        
        const filter = (i: any) => i.user.id == interaction.user.id
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });
    
        collector.on('collect', async i => {
            if(i.customId==='startwork') {
                try {
                    const res = await UserModel.findOneAndUpdate({
                        userid: profileData.userid
                    }, {
                        $set: {
                            [`drones.${botNum-1}.working`]:true,
                            [`drones.${botNum-1}.sent`]:Date.now()
                        }
                    });
                    embed.setFooter({text:'Work start!'})
                    startWork.setDisabled(true)
                    actionRow.setComponents(startWork)
                    response.edit({embeds:[embed],components:[actionRow]})
                    i.reply({content:`Work started!`,ephemeral:true})
                }catch(e){
                    console.log(e)
                    i.reply({content:`There was an error. Please try again`,ephemeral:true})
                    return
                }
            }
        })
    }
}