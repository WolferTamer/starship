import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
const UserModel = require("../../utils/schema");
const rollItems = require("../../utils/rollItems");
import {drones} from '../../../data/drones.json'
module.exports = {
  embed: new EmbedBuilder()
  .setTitle('fleet')
  .setDescription('Collect and send out all your drones at once. Any passive buffs to gathering do not apply to this command.'),
  data: new SlashCommandBuilder()
    .setName("fleet")
    .setDescription("Send your drones out to work"),
  async execute(interaction: ChatInputCommandInteraction, profileData: any) {
    let workingDrones = "";
    let completedDrones = "";
    let nonWorkingDrones = "";

    let inc: any = {};
    let set: any = {};

    for (let i = 0; i < profileData.drones.length; i++) {
      let obj = profileData.drones[i];
      if (obj.working) {
        const workTime = (2 / obj.speed) * obj.amount;
        if (Date.now() - obj.sent.getTime() >= workTime * 60000) {
          completedDrones += `${interaction.client.emojis.cache.get(drones[i].emoji)} `;
          let stuff = rollItems(obj);
          for (let [key, item] of Object.entries(stuff)) {
            if (inc[key]) {
              inc[key] += item;
            } else {
              inc[key] = item;
            }
          }
          set[`drones.${i}.sent`] = Date.now();
        } else {
          workingDrones += `${interaction.client.emojis.cache.get(drones[i].emoji)} `;
        }
      } else {
        nonWorkingDrones += `${interaction.client.emojis.cache.get(drones[i].emoji)} `;
        set[`drones.${i}.sent`] = Date.now();
        set[`drones.${i}.working`] = true;
      }
    }
    const embed = new EmbedBuilder()
      .setTitle(`Checked on your bots!`)
      .setColor(0x3ea5b3)
      .addFields([
        {
          name: `Completed Drones:`,
          value: `You got items from & resent: ${completedDrones}`,
        },
        {
          name: `Working Drones:`,
          value: `You're still waiting for: ${workingDrones}`,
        },
        {
          name: `Unworking Drones:`,
          value: `You sent out: ${nonWorkingDrones}`,
        },
      ]);

    try {
      const res = await UserModel.findOneAndUpdate(
        {
          userid: profileData.userid,
        },
        {
          $set: set,
          $inc: inc,
        }
      );
    } catch (e) {
      console.log(e);
      interaction.reply({content:`There was an error. Please try again`,ephemeral:true});
      return;
    }

    await interaction.reply({ embeds: [embed] });
  },
};
