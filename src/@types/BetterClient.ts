import { Collection } from "discord.js";
//Custom client class that replaces the default discord.js one. Contains the watched events, cooldowns, and commands
declare module "discord.js" {
  export interface Client {
    commands: Collection<any, any>;
    events: Collection<any, any>;
    cooldowns: Collection<any,any>;
  }
}