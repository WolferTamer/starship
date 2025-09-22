import { Client } from "discord.js";
import quests from "../../data/quests.json";
import { Objective, Quest } from "../@types/Quests";
const UserModel = require("./schema");

//Each of these functions is called when their respective task is done. The filter for if the action
//Will count towards the quest is done within the function

function weaponDestroyed(weapon: string, profileData: any) {
  if (profileData.quest.giver === "commander") {
    let quest = getQuest("commander", profileData.questindex.commander) as Quest;
    let updates :  {[key:string]:any}= {}
    for (let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "destroy" &&
        (objective.weapon === "any" || objective.weapon === weapon)
      ) {
        updates[`quest.progress.${i}`]=1
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function damageDealt(from:string, to:string, damage:number, profileData: any) {
  if(profileData.quest.giver === 'commander') {
    let quest: Quest = getQuest("commander", profileData.questindex.commander)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "damage" &&
        (objective.weapon === "any" || objective.weapon === from)
      ) {
        updates[`quest.progress.${i}`]=damage
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function itemObtained(item:string, amount:number, profileData: any) {
  if(profileData.quest.giver === 'miner') {
    let quest: Quest = getQuest("miner", profileData.questindex.miner)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "obtain" &&
        (objective.item === "any" || objective.item === item)
      ) {
        updates[`quest.progress.${i}`]=amount
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

//Variation on itemObtained that allowd for multiple items to be checked at once
function itemsObtained(items: {[key:string]:number}, profileData: any) {
  if(profileData.quest.giver === 'miner') {
    let quest: Quest = getQuest("miner", profileData.questindex.miner)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      for(let [item,amount] of Object.entries(items)) {
        if (
          objective.type === "obtain" &&
          (objective.item === "any" || objective.item === item)
        ) {
          let key = `quest.progress.${i}`
          if(!(key in updates)) {updates[key] = 0}
          updates[key]+=amount
        }
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function itemCompressed(item: string, amount:number, profileData: any) {
  if(profileData.quest.giver === 'miner') {
    let quest: Quest = getQuest("miner", profileData.questindex.commander)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "compress" &&
        (objective.item === "any" || objective.item === item)
      ) {
        updates[`quest.progress.${i}`]=amount
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function visited(place: string, profileData: any) {
  if(profileData.quest.giver === 'astronomer') {
    let quest: Quest = getQuest("astronomer", profileData.questindex.commander)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "visit" &&
        (objective.place === "any" || objective.place === place)
      ) {
        updates[`quest.progress.${i}`]=1
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function wonCombat(profileData: any) {
  if(profileData.quest.giver === 'astronomer') {
    let quest: Quest = getQuest("astronomer", profileData.questindex.commander)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "win"
      ) {
        updates[`quest.progress.${i}`]=1
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function craftedWeapon(weapon:string,profileData: any) {
  if(profileData.quest.giver === 'mechanic') {
    let quest: Quest = getQuest("mechanic", profileData.questindex.commander)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "create",
        (objective.weapon === "any" || objective.weapon === weapon)
      ) {
        updates[`quest.progress.${i}`]=1
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function upgradedWeapon(grade:number,profileData: any) {
  if(profileData.quest.giver === 'mechanic') {
    let quest: Quest = getQuest("mechanic", profileData.questindex.commander)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "upgrade",
        (objective.grade === -1 || objective.grade === grade)
      ) {
        updates[`quest.progress.${i}`]=1
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function activatedPet(pet:number,profileData: any) {
  if(profileData.quest.giver === 'mechanic') {
    let quest: Quest = getQuest("mechanic", profileData.questindex.commander)
    let updates :  {[key:string]:any}= {}
    for(let i = 0; i < quest.objectives.length; i++) {
      let objective = quest.objectives[i] as Objective;
      if (
        objective.type === "action",
        (objective.pet === -1 || objective.pet === pet)
      ) {
        updates[`quest.progress.${i}`]=1
      }
    }
    sendUpdates(updates,profileData.userid)
  }
}

function sendUpdates(updates: {[key:string]:any}, id:string) {
  if(Object.values(updates).length > 0) {
    try {
        let res = UserModel.findOneAndUpdate({
          userid:id
        }, {
          $inc: updates
        }).then(() => {

        })
      }
      catch(e) {
        return
      }
    }
}

function getQuest(giver: string, index: number) {
  let questInfo = quests[giver as keyof typeof quests].ordered[index] as Quest;
  if (index >= quests[giver as keyof typeof quests].ordered.length) {
    index =
      (index - quests[giver as keyof typeof quests].ordered.length) %
      quests[giver as keyof typeof quests].repeating.length;

    questInfo = quests[giver as keyof typeof quests].repeating[index];
  }
  return questInfo;
}

export {weaponDestroyed, damageDealt, getQuest, itemObtained, itemsObtained, itemCompressed, visited, wonCombat, craftedWeapon, upgradedWeapon, activatedPet}