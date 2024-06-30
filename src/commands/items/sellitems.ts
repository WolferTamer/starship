import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
const UserModel = require("../../utils/schema");
import * as items from "../../../data/items.json";
module.exports = {
  embed: new EmbedBuilder()
    .setTitle('sellitems')
    .setDescription('Sell a specific item from your inventory.')
    .setFields([{name:'[Item]',value:'The name of the item you would like to sell.'},
      {name:'{Amount}',value:'The amount of item you would like to sell. Default all of that particular item.'}
    ]),
  data: new SlashCommandBuilder()
    .setName("sellitems")
    .setDescription("Sell your items")
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
    const amount = interaction.options.getInteger("amount") ?? profileData.items[itemName]
    const item = items[itemName as keyof typeof items];
    if (!item) {
      interaction.reply({content:`The item ${itemName} does note exist.`,ephemeral:true});
      return;
    } else if (profileData.items[itemName] < amount || profileData.items[itemName] < 1) {
      interaction.reply({content:`You don't have enough ${item.name}`,ephemeral:true});
      return;
    }

    let cost = amount;
    switch(item.rarity) {
        case 0: cost*=1; break;
        case 1: cost*=5; break;
        case 2: cost*=25; break;
        case 3: cost*=200; break;
        case 4: cost*=2500; break;
    }

    let embed = new EmbedBuilder()
      .setTitle(`Sold ${item.name}`)
      .setColor(0x0565ff)
      .setDescription(`Sold ${amount} x ${interaction.client.emojis.cache.get(item.emoji)} ${item.name} for ${cost}`);

    try {
      const response = await UserModel.findOneAndUpdate({
          userid: interaction.user.id
      }, {
          $inc: {
              balance:cost,
              [`items.${itemName}`]:-amount
          }
      });
    } catch(e) {
      console.log(e)
      interaction.reply({content:`An error occured`,ephemeral:true})
      return;
    }

    interaction.reply({ embeds: [embed] });
  },
};
