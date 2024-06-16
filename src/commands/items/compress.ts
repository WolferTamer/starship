import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
  } from "discord.js";
  const UserModel = require("../../utils/schema");
  const tierToName = require("../../utils/tierToname")
  import items from "../../../data/items.json";
  module.exports = {
    data: new SlashCommandBuilder()
      .setName("compress")
      .setDescription("Compress 100 of a specific item")
      .addStringOption((option) =>
        option
          .setName("item")
          .setDescription("The item you wish to buy")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("amount")
          .setDescription("The amount you want to sell")
          .setRequired(false)
          .setMinValue(1)
      ),
    async execute(interaction: ChatInputCommandInteraction, profileData: any) {
      const itemName = interaction.options.getString("item")!.toLowerCase().replace(/\s/g, '');;
      const amount = (interaction.options.getInteger("amount") ?? 1)*100
      const item = items[itemName as keyof typeof items];
      if (!item) {
        interaction.reply({content:`The item ${itemName} does note exist.`,ephemeral:true});
        return;
      } else if (profileData.items[itemName] < amount || profileData.items[itemName] < 1) {
        interaction.reply({content:`You only have ${profileData.items[itemName]} ${item.name}`,ephemeral:true});
        return;
      }
      let coreid = `${tierToName(item.rarity)}core`
      let coreitem = items[coreid as keyof typeof items]
  
      let embed = new EmbedBuilder()
        .setTitle(`Compressed ${item.name}`)
        .setColor(0x0565ff)
        .setDescription(`Compress ${amount} x ${interaction.client.emojis.cache.get(item.emoji)} ${item.name} for ${amount/100} x ${interaction.client.emojis.cache.get(coreitem.emoji)} ${coreitem.name}`);
  
      const response = await UserModel.findOneAndUpdate({
          userid: interaction.user.id
      }, {
          $inc: {
            [`items.${coreid}`]:amount/100,
              [`items.${itemName}`]:-amount
          }
      });
  
      interaction.reply({ embeds: [embed] });
    },
  };
  