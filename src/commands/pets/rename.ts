import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
import * as pets from '../../../data/pets.json'
const UserModel = require('../../utils/schema')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('rename')
		.setDescription('Rename one of your pets!')
        .addStringOption((option)=>option.setName('pet').setDescription('The current name of the pet you wish to rename')
            .setRequired(true))
            .addStringOption((option)=>option.setName('newname').setDescription('The new name for the pet')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        let oldName = interaction.options.getString('pet')!
        let newName = interaction.options.getString('newname')!


        //Finds the pet based on the name provided
        let index = profileData.pets.findIndex((element : any) => element.petname.toLowerCase() === oldName.toLowerCase())
        if(index < 0) {
            interaction.reply( {content:`You don't seem to have a pet named ${oldName}`,ephemeral:true})
            return;
        }

        let data : any = {}
        data[`pets.${index}.petname`] = newName
        const response2 = await UserModel.findOneAndUpdate({
            userid: interaction.user.id
        }, {
            $set: data
        });

		interaction.reply(`${oldName} was renamed to ${newName}`);
	},
};