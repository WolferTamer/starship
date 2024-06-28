import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
import * as pets from '../../../data/pets.json'
const UserModel = require('../../utils/schema')

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('choosepet')
    .setDescription('Choose which pet you would like to equip.')
    .setFields([{name:'[pet]',value:'The name of your pet that you would like to choose.'}]),
	data: new SlashCommandBuilder()
		.setName('choosepet')
		.setDescription('Rename one of your pets!')
        .addStringOption((option)=>option.setName('pet').setDescription('The pet you want to be by your side')
            .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        let name = interaction.options.getString('pet')!


        let index = profileData.pets.findIndex((element : any) => element.petname.toLowerCase() === name.toLowerCase())
        if(index < 0) {
            interaction.reply( {content:`You don't seem to have a pet named ${name}`,ephemeral:true})
            return;
        }

        const response2 = await UserModel.findOneAndUpdate({
            userid: interaction.user.id
        }, {
            $set: {
                pet:index
            }
        });

		interaction.reply(`${name} was chosen`);
	},
};