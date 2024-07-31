import {time,
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    TimestampStyles,
  } from "discord.js";
  const UserModel = require("../../utils/schema");
  const tierToName = require("../../utils/tierToname")
  import items from "../../../data/items.json";
  module.exports = {
    embed: new EmbedBuilder()
    .setTitle('daily')
    .setDescription('Collect your daily rewards and build up a streak. Every day you collect in a row you earn an extra $500, and every 10 days you get a higher quality resource core. Once you reach the maximum tier core, you instead get an extra one every 10 days.'),
    data: new SlashCommandBuilder()
      .setName("daily")
      .setDescription("Collect a daily reward and earn a streak"),
    async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        let lastCollect = profileData.dailytime
        let curStreak = profileData.dailystreak

        if(Date.now()-lastCollect < 86400000) {
            interaction.reply(`Your daily rewards will be available in ${time(new Date(lastCollect.getTime()+86400000), TimestampStyles.RelativeTime)}`)
            return;
        } if (Date.now()-lastCollect > 2*86400000) {
            curStreak = 0
        }

        let coreTier = Math.min(Math.floor(curStreak/10),5)
        let extras = Math.max(Math.floor(curStreak/10 - 5),0)
        let money = 500*(curStreak+1)
        let data = {
            [`items.${tierToName(coreTier)}core`] : 1+extras,
            balance: money
        }

        try {
            const response = await UserModel.findOneAndUpdate({
                userid: interaction.user.id
            }, {
                $inc: data,
                $set: {
                    dailytime: Date.now(),
                    dailystreak: curStreak+1
                }
            });
        } catch(e) {
            interaction.reply({content:`An erro occured claiming your reward, please try again.`, ephemeral:true})
            return;
        }
        let itemInfo = items[`${tierToName(coreTier)}core` as keyof typeof items]
        const embed = new EmbedBuilder()
            .setTitle(`Claimed Your Daily Rewards!`)
            .setDescription(`**You Earned** \n$${money}\n${1+extras} x ${interaction.client.emojis.cache.get(itemInfo.emoji)} ${itemInfo.name}`)
            .setFooter({text:`Current Streak: ${curStreak}`})
  
        interaction.reply({ embeds: [embed] });
    },
  };
  