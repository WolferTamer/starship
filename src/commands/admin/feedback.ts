import { ChatInputCommandInteraction, ColorResolvable, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, TextChannel } from "discord.js";
const UserModel = require('../../utils/schema');
import 'dotenv/config'

module.exports = {
    cooldown:300,
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Send feedback to the bot developers!')
        .addStringOption((option) =>
            option.setName('type').setDescription('The type of critique you wish to give')
        .setRequired(true).setChoices ( {name: 'Misc.', value:'misc'},
            {name:'Bug Report',value:'bug'}
        )
        ).addStringOption((option) => option
            .setName('content').setDescription('The content of your critique')
        .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {

        if(profileData.muted) {
            interaction.reply({content:`I'm sorry, you are banned from providing feedback. If this has been done in error please contact a developer.`,ephemeral:true})
            return;
        }
        const options = interaction.options;
        const type = options.getString('type')!;
        const content = options.getString('content')!;
        let color:ColorResolvable = 0xFFFFFF
        let title:string = 'Report'
        switch(type) {
            case 'misc': {
                title = 'Misc. Feedback'
                color = 0x00FF00
            }
            case 'bug': {
                title = 'Bug Report'
                color = 0xFF0000
            }
        }

        let embed = new EmbedBuilder()
            .setTitle(`${title} from ${interaction.user.globalName}`)
            .setDescription(content)
            .setFooter({text:`User ID: ${interaction.user.id}`})
            .setColor(color);

        (interaction.client.channels.cache.get(process.env.FEEDBACK!) as TextChannel).send({embeds:[embed]})
        embed.setTitle(`Sent ${title} to the Developers`)
		interaction.reply({embeds:[embed]});
	},
};