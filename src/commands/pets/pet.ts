import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } from "discord.js";
const UserModel = require('../../utils/schema')
import * as pets from '../../../data/pets.json'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pet')
		.setDescription('Check the pet you have!')
		.addUserOption((option:SlashCommandUserOption) => option
		.setName('user').setDescription('The user you want to check the pet of').setRequired(false)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
		const options = interaction.options;
        let user = options.getUser('user');
		if(user) {
			try{
				profileData = await UserModel.findOne({userid:user.id});
				if(!profileData) {
					interaction.reply("This user has not used this bot and does not have a profile.")
					return;
				}
			} catch (e) {
				console.log(e)
				interaction.reply("An error occured. please try again.")
				return;
			}
		} else {
            user = interaction.user
        }

        if(profileData.pets.length < 1) {
            interaction.reply("This user doesn't have a pet yet.")
			return;
        }

        let embed = new EmbedBuilder()
            .setTitle(`Your Pets`)
            .setDescription('A list of all your pets')
            .setColor(0x0565ff)

		profileData.pets.forEach((obj : any, index : number) => {
			const pet = pets.pets[obj.petid]
			let nameVal = `${obj.petname} ${pet.icon}`
			if(index==profileData.pet) { nameVal+=' (Chosen)'}
			embed.addFields( {
				name:nameVal,
				value:pet.description
			})
		})
		interaction.reply({embeds:[embed]});
	},
};