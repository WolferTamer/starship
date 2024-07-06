import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, CommandInteraction, ComponentType, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandNumberOption } from "discord.js";
const generateAsteroidField = require('../../utils/generateAsteroidField');
const UserModel = require('../../utils/schema');

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('navigate')
    .setDescription('Memorize and copy a path through an asteroid field to earn some money.'),
    cooldown:30,
	data: new SlashCommandBuilder()
		.setName('navigate')
		.setDescription('Memorize and copy a path through an asteroid field to earn some money.'),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const field = await generateAsteroidField()
        let text = createText(field,0,0,true)
        
        const embed = new EmbedBuilder()
            .setTitle(`Asteroid Field`)
            .setColor(0xf59342)
            .setDescription(text)
            .setFooter({text:`You have 60 seconds to get to the ❌. Complete it faster to win more money. Once you move you can't see the asteroids.`})

        let x = 0, y =0;

        const upButton = new ButtonBuilder()
            .setEmoji('⬆️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('navigateup')
        const downButton = new ButtonBuilder()
            .setEmoji('⬇️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('navigatedown')
        const leftButton = new ButtonBuilder()
            .setEmoji('⬅️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('navigateleft')
        const rightButton = new ButtonBuilder()
            .setEmoji('➡️')
            .setStyle(ButtonStyle.Success)
            .setCustomId('navigateright')
        const actionrow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents(leftButton,upButton,downButton,rightButton)

		const response = await interaction.reply({embeds:[embed],components:[actionrow]});

        const filter = (i: any) => i.user.id == interaction.user.id

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000, filter });
    
        //When the button is clicked send the changes to the database and edit the reply.
        collector.on('collect', async i => {
            if(field[y][x] || (y == field.length-1 && x == field[0].length-1)) {
                i.deferUpdate()
                return;
            }
            if(i.customId === 'navigateup') {
                if(y > 0) {
                    y--;
                } else {
                    i.deferUpdate()
                    return;
                }
            } else if(i.customId === 'navigatedown') {
                if(y >= field.length-1) {
                    i.deferUpdate()
                    return
                }
                y++;
            } else if(i.customId === 'navigateright') {
                if(x >= field[0].length-1) {
                    i.deferUpdate()
                    return
                }
                x++;
            } else if(i.customId === 'navigateleft') {
                if(x <= 0) {
                    i.deferUpdate()
                    return
                }
                x--;
            }
            if(i.customId.includes('navigate')) {
                embed.setDescription(createText(field,y,x))
                if(field[y][x]) {
                    embed.setFooter({text:`You ran into an asteroid`})
                    embed.setColor(0xFF0000)
                }
                if(y == field.length-1 && x == field[0].length-1) {
                    embed.setColor(0x00FF00)
                    let amount = Math.round((2**(profileData.badgetier-7))*(response.createdTimestamp+60000-Date.now())/2)
                    embed.setFooter({text:`You won $${amount}`})
                    try {
                        const res = await UserModel.findOneAndUpdate({
                            userid: interaction.user.id
                        }, {
                            $inc: {balance:amount}
                        });
                    }catch(e) {
                        console.log(e)
                        i.reply({content:`An error occured and your money was not awarded`, ephemeral:true})
                    }
                }
                response.edit({embeds:[embed],components:[actionrow]})
                i.deferUpdate()
            }
        })
	},
};

function createText(field: boolean[][], x: number, y: number, firstMove: boolean = false) {
    let text = ''
    for(let i = 0; i < field.length; i++) {
        for(let j = 0; j < field[i].length;j++) {
            if (i == field.length-1 && j == field[i].length-1){
                if(i ==x && j ==y) {
                    text+='🎉'
                } else {
                    text+='❌'
                }
            }else if(field[i][j]) {
                if(i ==x && j ==y) {
                    text+='💥'
                } else if (firstMove){
                    text+='☄️'
                } else {
                    text+='➕'
                }
            } else {
                if(i ==x && j ==y) {
                    text+='🟢'
                } else {
                    text+='➕'
                }
            }
        }
        text+='\n'
    }
    return text
}