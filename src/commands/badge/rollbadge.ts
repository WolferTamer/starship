import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandIntegerOption } from "discord.js";
import mongoose from "mongoose";
const UserModel = require('../../utils/schema')

module.exports = {
    embed: new EmbedBuilder()
    .setTitle('rollbadge')
    .setDescription('Roll for a brand new badge. If you roll lower than your current tier it will not be replaced.')
    .setFields([
        {name:'{Amount}',value:'The amount of money to spend on a roll. What you can get increases the more you spend.'},]),
    cooldown:10,
	data: new SlashCommandBuilder()
		.setName('rollbage')
		.setDescription('Spend money to roll for a new badge')
        .addIntegerOption((option: SlashCommandIntegerOption) => option.setMinValue(0).setMaxValue(100000)
        .setRequired(false).setName('amount')
        .setDescription('The amount you want to spend. The higher amount, the better your chances')),
	async execute(interaction: ChatInputCommandInteraction, profileData: any) {
        const amount = interaction.options.getInteger('amount') ?? 0;
        if(amount > profileData.balance) {
            interaction.reply(`You don't have enough money to pay ${amount}`)
            return;
        }

        //If any required vals do not exist, set them now.
        let data : any= {}
        if(!profileData.badgetier) {
            data["badgetier"] = 0;
        }
        if(!profileData.badgedate) {
            data["badgedate"] = Date.now
        }
        if(Object.keys(data).length > 0) {
            const response = UserModel.findOneAndUpdate({
                userid:interaction.user.id
            },{
                $set: data
            })
        }

    
        profileData = await UserModel.findOne({userid:interaction.user.id});
        const chances = badgeChances(amount)

        //Get a random number then compare it to each chance to see which badge to award.
        const rand = Math.random();
        let text = ""
        let badgeRes = 0
        if(rand < chances[0]) {
            badgeRes = 1
        } else if (rand < chances[1]+chances[0]){
            badgeRes = 2
        } else if (rand < chances[1]+chances[0]+chances[2]){
            badgeRes = 3
        } else if (rand < chances[1]+chances[0]+chances[3]+chances[2]){
            badgeRes = 4
        } else if (rand < chances[1]+chances[0]+chances[4]+chances[2]+chances[3]){
            badgeRes = 5
        } else if (rand < chances[1]+chances[0]+chances[5]+chances[4]+chances[2]+chances[3]){
            badgeRes = 6
        }

        //If the user already has a badge of equal or greater quality, don't change it.
        let embed:EmbedBuilder
        if(profileData.badgetier<badgeRes) {
            embed = new EmbedBuilder()
                .setTitle(`${interaction.user.displayName} Earned a New Badge!`)
                .setTimestamp(Date.now())
                .setColor(0x00FF00)
                .setDescription(`You spent $${amount} and got a ${tierToColor(badgeRes)} badge, which is ${badgeRes-profileData.badgetier} better than your old badge.`)
                .setFooter({text:`Check /badge to see what your new badge does.`})
        } else {
            embed = new EmbedBuilder()
                .setTitle(`${interaction.user.displayName} Didn't Find a New Badge`)
                .setTimestamp(Date.now())
                .setColor(0xFF0000)
                .setDescription(`You spent $${amount} and got a ${tierToColor(badgeRes)} badge, which isn't better than your current badge.`)
                badgeRes = 0
        }

        updateBadge(interaction.user.id, badgeRes, amount)
        
		interaction.reply({embeds:[embed]});
	},
};

async function updateBadge(id:string, badge:number, amount:number) {
    //Update the data. Don't send anything if no money was spent & the badge didn't change.
    if(amount == 0 && badge == 0) {
        return
    }
    let data: any = {};
    if(badge != 0) {
        data["$set"] = {
            badgetier:badge,
            badgedate:Date.now()
        }
    }
    if(amount > 0) {
        data["$inc"] = {
            balance:-amount
        }
    }
    const response = await UserModel.findOneAndUpdate({
        userid:id
    },data)
}

//Returns an array of numbers that represent the chances of each badge. 
//Badges above blue have a threshold as to when you can get them.
//Money in between the thresholds improve your chances of getting better badges.
//$100: Purple badge
//$1000: Red badge
//$10000: Orange badge
//$100000: Gold badge
function badgeChances(amount:number) {
    let chances = [.8,.2,0,0,0,0];
    let dec = 100;
    if(amount>=100000) {
        chances = [.48,.2,.15,.1,.06,.01]
    } else if (amount>=10000) {
        chances = [.5,.2,.15,.1,.05,0]
        dec = 100000
    } else if (amount>=1000) {
        chances = [.6,.2,.15,.05,0,0]
        dec = 10000
    } else if (amount>=100) {
        chances = [.6,.3,.1,0,0,0]
        dec = 1000
    }

    //reduces the chances of a green badge, then adjusts all values to make the sum = 1
    if(amount < 100000) {
        const ratio = (amount-dec/10)/dec/10;
        chances[0]-=ratio;
    }
    const sum = chances.reduce((a, b) => a + b, 0)
    for(let i = 0; i < chances.length;i++) {
        chances[i]= chances[i]/sum
    }
    return chances;
}

function tierToColor(tier:number) {
    if(tier == 0) {
        return "white"
    }else if(tier == 1) {
        return "green"
    } else if (tier == 2) {
        return "blue"
    } else if (tier == 3) {
        return "purple"
    } else if (tier == 4) {
        return "red"
    } else if (tier == 5) {
        return "orange"
    } else if (tier == 6) {
        return "gold"
    }
}