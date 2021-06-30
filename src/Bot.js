const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const FileStorage = require('./FileStorage.js');

//Start bot
class Bot extends EventEmitter {
  constructor() {
    super();
    this.dbFolderPath;
    this.possibleModules = {
      responseModule: require('./app-modules/Response.js'),
    }
    this.ModulesInUse = [];
  }

  allowChannels(guilds, msg) {
    const msgChannelID = msg.channel.id;
    if(msg.author.bot) {
      console.log("1");
      return
    };
    Object.keys(guilds).forEach(el => {
      const notOnWhitelist = (guilds[el]["isWhitelist"] && !(guilds[el].channels.includes(msgChannelID)));
      const onBlacklist = ( (!(guilds[el]["isWhitelist"])) && (guilds[el].channels.includes(msgChannelID)) );
      if( notOnWhitelist || onBlacklist ) {
        console.log("2");  
        return
      };
      console.log(msgChannelID);
      console.log(guilds[el].guild);
      if(msgChannelID === guilds[el].guild) {
        console.log("3");;
      }
      console.log("4");
    })
  }

  readStartConfig(dirName, fileStorageInstance) {
    this.dbFolderPath = path.join(dirName,"start-config");
    let readBotConfig = fileStorageInstance.readFile(this.dbFolderPath, "BotData.json");
    readBotConfig = JSON.parse(readBotConfig);
    const clientToken = readBotConfig["clientToken"];
    const guilds = readBotConfig["guilds"];
    let readModuleConfig = fileStorageInstance.readFile(this.dbFolderPath, "Modules_In_Use.json");
    readModuleConfig = JSON.parse(readModuleConfig);
    const configMainKeys = Object.keys(readModuleConfig);

    return {readBotConfig, clientToken, readModuleConfig, configMainKeys, guilds}
  }

  startBot(dirName) {
    const client = new Discord.Client();
    const fileStorageInstance = new FileStorage();
    const {readBotConfig, clientToken, readModuleConfig, configMainKeys, guilds} = this.readStartConfig(dirName, fileStorageInstance);
    Object.keys(this.possibleModules).forEach(el => {
      configMainKeys.forEach(el2 => {
        if (el2 === el) {
          const moduleConfig = readModuleConfig[el];
          this.ModulesInUse.push(el); 
          const moduleInstance = new this.possibleModules[el](moduleConfig, dirName, this.dbFolderPath, fileStorageInstance);
          moduleInstance.readStart();
        }
      }) 
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
      if(msg.channel.id !== '835632109300744262' && msg.channel.id !== '835568521312337980' && msg.channel.id !== '835579274865803325') {
        return;
      }
 
    });
    client.on('ready', async () => {
      const myGuild1 = await client.guilds.fetch('835568453649170472');
      const roleChannel = myGuild1.channels.cache.find(ch => ch.id === '858001836410011658');

    });
    
    client.login(clientToken);
    console.log("Used modules:" ,this.ModulesInUse);
  }
}

module.exports = Bot;