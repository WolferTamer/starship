import { ChatInputCommandInteraction, ColorResolvable, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption, TextChannel } from "discord.js";
const UserModel = require('../../utils/schema');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

module.exports = {
    embed: new EmbedBuilder()
        .setTitle('feedback')
        .setDescription('This command sends a section of feedback to the bot developers. This can be used for bugs & general advice. People who abuse this feature can be muted or banned from the bot.')
        .setFields([{name:'[Type]',value:'The type of feedback you wish to send. There is a preselected list of options, including bug reports and misc.'},
            {name:'[Content]',value:'The actual text of your report.'}
        ]),
    cooldown:300,
	data: new SlashCommandBuilder()
		.setName('feedback')
		.setDescription('Send feedback to the bot developers!')
        .addStringOption((option) =>
            option.setName('type').setDescription('The type of critique you wish to give')
        .setRequired(true).setChoices ( {name: 'Misc.', value:'misc'},
            {name:'Bug Report',value:'bug'},
            {name:'Feature Request', value:'feature'},
            {name:'Enhancement',value:'enhance'}
        )
        ).addStringOption((option) => option
            .setName('content').setDescription('The content of your critique')
        .setRequired(true)),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {

        //If the user has been muted then immediately end the command
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
                color = 0xFFA500
            }
            case 'bug': {
                title = 'Bug Report'
                color = 0xFF0000
            } case 'feature': {
                title = 'Feature Request'
                color = 0x00FF00
            } case 'enhance': {
                title = 'Enhancement'
                color = 0x0000FF
            }
        }
        
        let embed = new EmbedBuilder()
            .setTitle(`${title} from ${interaction.user.tag}`)
            .setDescription(content)
            .setFooter({text:`User ID: ${interaction.user.id}`})
            .setColor(color);

        (interaction.client.channels.cache.get(process.env.FEEDBACK!) as TextChannel).send({embeds:[embed]})
        embed.setTitle(`Sent ${title} to the Developers`)
		interaction.reply({embeds:[embed]});
	},
};