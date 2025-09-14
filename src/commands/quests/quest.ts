import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  CommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandUserOption,
} from "discord.js";
import quests from "../../../data/quests.json";
import { Quest } from "../../@types/Quests";
const UserModel = require("../../utils/schema");
import items from '../../../data/items.json'

module.exports = {
  embed: new EmbedBuilder()
    .setTitle("quest")
    .setDescription(
      "View your current quest progress, turn it in, and choose new ones."
    ),
  data: new SlashCommandBuilder()
    .setName("quest")
    .setDescription("Interact with your quests!"),
  async execute(interaction: ChatInputCommandInteraction, profileData: any) {
    let quest = profileData.quest;
    let embed: EmbedBuilder;
    let actionRow: ActionRowBuilder<ButtonBuilder>;
    if (quest.giver === "") {
      [embed, actionRow] = chooseGiverEmbed();
    } else {
      [embed, actionRow] = questProgressEmbed(profileData);
    }

    const reply = await interaction.reply({
      embeds: [embed],
      components: [actionRow],
    });

    const filter = (i: any) => i.user.id == interaction.user.id;
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300_000,
      filter,
    });

    collector.on("collect", async (i) => {
      if (i.customId.includes("quest")) {
        let giver = i.customId.substring(5);
        let curIndex = profileData.questindex[giver];
        let newQuest : Quest
        if (curIndex >= quests[giver as keyof typeof quests].ordered.length) {
          curIndex =
            (curIndex - quests[giver as keyof typeof quests].ordered.length) %
            quests[giver as keyof typeof quests].repeating.length;
          newQuest = quests[giver as keyof typeof quests].repeating[curIndex];
        } else {
            newQuest = quests[giver as keyof typeof quests].ordered[
          curIndex
        ] as Quest
        }
        let progressItems = [];
        for (let objective of newQuest.objectives) {
          progressItems.push(0);
        }
        let data = {
          giver: giver,
          index: 0,
          progress: progressItems,
        };
        profileData = await UserModel.findOneAndUpdate(
          {
            userid: interaction.user.id,
          },
          {
            $set: {
              quest: data,
            },
          },
          {new:true}
        );
        let objs = questProgressEmbed(profileData)
        interaction.editReply({ embeds:[objs[0]], components: [objs[1]] });
        i.deferUpdate()
      } else if (i.customId === "turnin") {
        let curIndex = profileData.questindex[profileData.quest.giver];
        let newQuest = quests[profileData.quest.giver as keyof typeof quests]
          .ordered[curIndex] as Quest;
        if (
          curIndex >=
          quests[profileData.quest.giver as keyof typeof quests].ordered.length
        ) {
          curIndex =
            (curIndex -
              quests[profileData.quest.giver as keyof typeof quests].ordered
                .length) %
            quests[profileData.quest.giver as keyof typeof quests].repeating
              .length;
          newQuest =
            quests[profileData.quest.giver as keyof typeof quests].repeating[
              curIndex
            ];
        }

        profileData = await UserModel.findOneAndUpdate(
          {
            userid: interaction.user.id,
          },
          {
            $set: {
              quest: {},
              items: newQuest.reward,
            },
            $inc: {
              [`questindex.${profileData.quest.giver}`]: 1,
            },
          }
        );
        let objs = questRewardEmbed(newQuest,interaction.client)
        interaction.editReply({ embeds:[objs[0]], components: [objs[1]] });
        i.deferUpdate()
      } else if (i.customId === 'choosenew') {
        let objs = chooseGiverEmbed()
        interaction.editReply({ embeds:[objs[0]], components: [objs[1]] });
        i.deferUpdate()
      }
    });
  },
};

function chooseGiverEmbed(): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  let embed = new EmbedBuilder();

  let actionRow = new ActionRowBuilder<ButtonBuilder>();
  embed.setTitle(`Choose who to get your next quest from!`).setColor(0xff0000);
  let buttons = [];
  for (let [key, value] of Object.entries(quests)) {
    embed.addFields([{ name: value.name, value: value.description }]);
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`quest${key}`)
        .setLabel(value.name)
        .setStyle(ButtonStyle.Primary)
    );
  }
  actionRow.setComponents(buttons);

  return [embed, actionRow];
}

function questProgressEmbed(profileData: any): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
  let quest = profileData.quest
  let embed = new EmbedBuilder();

  let actionRow = new ActionRowBuilder<ButtonBuilder>();
  let curIndex = profileData.questindex[profileData.quest.giver];
  let giver = profileData.quest.giver
  let questInfo : Quest
        if (curIndex >= quests[giver as keyof typeof quests].ordered.length) {
          curIndex =
            (curIndex - quests[giver as keyof typeof quests].ordered.length) %
            quests[giver as keyof typeof quests].repeating.length;
          questInfo = quests[giver as keyof typeof quests].repeating[curIndex];
        } else {
        
            questInfo = quests[giver as keyof typeof quests].ordered[
          curIndex
        ] as Quest
        }

  embed
    .setTitle(questInfo.title)
    .setDescription(
      `For The ${quests[profileData.quest.giver as keyof typeof quests].name}`
    );
  let finished = true;
  for (let i = 0; i < questInfo.objectives.length; i++) {
    let objective = questInfo.objectives[i];
    let progress = quest.progress[i];
    embed.addFields([
      { name: objective.name, value: `${progress}/${objective.amount}` },
    ]);
    if (objective.amount > progress) {
      finished = false;
    }
  }

  let turnButton = new ButtonBuilder()
    .setCustomId("turnin")
    .setLabel("Turn In!")
    .setStyle(ButtonStyle.Success);

  if (finished) {
    embed.setColor(0x00ff00);
  } else {
    embed.setColor(0x0000ff);
    turnButton.setDisabled(true);
  }
  actionRow.setComponents([turnButton]);
  return [embed,actionRow]
}

function questRewardEmbed(quest: Quest, client: Client): [EmbedBuilder, ActionRowBuilder<ButtonBuilder>] {
    let embed = new EmbedBuilder()
    let actionRow = new ActionRowBuilder<ButtonBuilder>()

    embed.setTitle('Quest Claimed!')
    .setDescription(`You claimed the rewards for ${quest.title}`)
    .setColor(0x00ff00)
    
    for(let [item,amount] of Object.entries(quest.reward)) {
        let info = items[item as keyof typeof items]
        embed.addFields( {
            name:`${info.name} ${client.emojis.cache.get(info.emoji)}`,
            value:`${amount}`
        })
    }

    let button = new ButtonBuilder()
    .setLabel('Continue')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('choosenew')

    actionRow.setComponents([button])

    return [embed,actionRow]

}
