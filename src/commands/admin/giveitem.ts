import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as items from '../../../data/items.json'
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
                    interaction.reply("This user has not used this bot and does not have a profile.")
                    return;
                } 
            } catch (e) {
                console.log(e)
                interaction.reply("An error occured. please try again.")
                return;
            }
        }
        
        if(!item) {
            interaction.reply(`The item ${itemName} does not exist.`)
            return;
        } else if (!isAdmin){
            interaction.reply(`You are not an admin.`)
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
            interaction.reply('An error occured. please try again.')
            return;
        }
        
		interaction.reply(`${interaction.user} gave ${recipient ?? 'themselves'} ${amount} of ${itemName}`);
	},
};