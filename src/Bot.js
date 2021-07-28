const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const FileStorage = require('./FileStorage.js');

//Start bot
class Bot {
  constructor() {
    this.dbFolderPath;
    this.availableModules = {
      response: require('./app-modules/Response.js'),
    }
    this.loadedModules = [];
  }

  allowChannels(guilds, msg) {
    const msgChannelID = msg.channel.id;
    if(msg.author.bot) {
      return
    };
    Object.keys(guilds).forEach(el => {
      const guildEl = guilds[el];
      const notOnWhitelist = guildEl.isWhitelist && !guildEl.channels.includes(msgChannelID);
      const onBlacklist = !guildEl.isWhitelist && guildEl.channels.includes(msgChannelID);
      if( notOnWhitelist || onBlacklist ) {
        return
      };
    })
  }

  readStartConfig(dirName, fileStorageInstance) {
    this.dbFolderPath = path.join(dirName,"start-config");
    const readBotConfig = JSON.parse(fileStorageInstance.readFile(this.dbFolderPath, "BotData.json"));
    const { clientToken, guilds } = readBotConfig;
    return {readBotConfig, clientToken, guilds}
  }

  startBot(dirName) {
    const client = new Discord.Client();
    const fileStorageInstance = new FileStorage();
    const {readBotConfig, clientToken, guilds} = this.readStartConfig(dirName, fileStorageInstance);
    Object.keys(this.availableModules).forEach(moduleName => {
      let moduleConfig = {};
      guilds.forEach(el => {
        moduleConfig[el.guild] = el.modules[moduleName];
      });
      const moduleInstance = new this.availableModules[moduleName](moduleConfig, dirName, this.dbFolderPath, fileStorageInstance);
      this.loadedModules.push(moduleInstance); 
    })

    client.on('ready', () => {
      console.log(`Logged in as ${client.user.tag}!`);
    });
    
    
    client.on('raw', ({ op, t, d }) => {
      if(op !== 0) return;
      // console.log(`\n>>>>>>PACKET ${t} >>>>>>> \n`, d, `\n<<<<<<<<<<<<\n`);
    });
    
    client.on('message', msg => {
      this.allowChannels(guilds, msg);
    });
    client.on('ready', async () => {
      const myGuild1 = await client.guilds.fetch('835568453649170472');
      const roleChannel = myGuild1.channels.cache.find(ch => ch.id === '858001836410011658');

    });
    
    client.login(clientToken);
    console.log("Used modules:", this.loadedModules);
  }
}

module.exports = Bot;