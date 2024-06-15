import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import items from '../../../data/items.json'
import {admins} from '../../../config.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('giveitem')
		.setDescription('Admin command to give yourself an item!')
        .addStringOption((option)=>option.setName('item').setDescription('The item you wish to get')
            .setRequired(true))
        .addIntegerOption((option)=>option.setName('amount').setDescription('The amount of items you want')
            .setRequired(true))
        .addUserOption((option) => option.setName('user').setDescription('The user you want to give an item to (yourself by default)')
            .setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const itemName = interaction.options.getString('item')!.toLowerCase()
        const amount = interaction.options.getInteger('amount')!
        const recipient = interaction.options.getUser('user')
        const item = items[itemName as keyof typeof items]

        const isAdmin = admins.findIndex((item) => item === interaction.user.id) >= 0

        if(recipient) {
            try{
                profileData = await UserModel.findOne({userid:recipient.id});
                if(!profileData) {
                    interaction.reply({content:"This user has not used this bot and does not have a profile.",ephemeral:true})
                    return;
                } 
            } catch (e) {
                console.log(e)
                interaction.reply({content:"An error occured. please try again.",ephemeral:true})
                return;
            }
        }
        
        if(!item) {
            interaction.reply({content:`The item ${itemName} does not exist.`,ephemeral:true})
            return;
        } else if (!isAdmin){
            interaction.reply({content:`You are not an admin.`,ephemeral:true})
            return;
        } 


		
        try {
            const response = await UserModel.findOneAndUpdate({
                userid: profileData.userid
            }, {
                $inc: {[`items.${itemName}`]:amount}
            });
        } catch(e) {
            console.log(e);
            interaction.reply({content:'An error occured. please try again.',ephemeral:true})
            return;
        }
        let embed = new EmbedBuilder()
            .setTitle(`${interaction.user.displayName} Gave Items to ${recipient?.displayName ?? 'Themselves'}`)
            .setDescription(`${amount} x ${interaction.client.emojis.cache.get(item.emoji)} ${item.name}`)
            .setColor(0x45cf3e)
		interaction.reply({embeds:[embed]});
	},
};