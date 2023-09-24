const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const interactions = require('./interactions');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class ConfigLoader {
  constructor(configDir) {
    this.configDir = configDir;
    this.configData = {
      commandTags: {},
      reactReplyTo: {},
      reactHow: {},
      replyHow: {}
    };
}


  readTxtFile(dir, file, fileName) {
    const lines = fs.readFileSync(path.join(`${this.configDir}/${dir}`, file), 'utf8')
    .split(/\r?\n/)
    .filter(line => line.trim());

    switch(dir) {
      case 'reactReplyTo':
        this.configData.reactReplyTo[fileName] = lines.map(line => new RegExp(line)).sort((a, b) => b.toString().length - a.toString().length);
        break;
      case 'commandTags':
        this.configData.commandTags[fileName] = lines.map(line => new RegExp("!" + line)).sort((a, b) => b.toString().length - a.toString().length);
        break;  
      default:
        console.error(`Unsupported directory name for TXT: ${dir}`);
    }
  }

  readJsonFile(dir, file, fileName) {
    const jsonData = JSON.parse(fs.readFileSync(path.join(`${this.configDir}/${dir}/`, file), 'utf8'));
    switch(dir) {
      case 'reactHow':
        this.configData.reactHow[fileName] = jsonData;
        break;
      case 'replyHow':
        this.configData.replyHow[fileName] = jsonData;
        break;
      default: 
        console.error(`Undupported directory name for JSON: ${dir}`);
    }
  }

  readFolderContents(dir) {
    const files = fs.readdirSync(`${this.configDir}/${dir}`);


    files.forEach(file => {
      const extension = path.extname(file);
      const fileName = path.basename(file, extension);
      if (extension === '.txt') {
        this.readTxtFile(dir, file, fileName);
      } else if (extension === '.json') {
        this.readJsonFile(dir, file, fileName);
      }
    });
  }
  
  load() {
    ['reactReplyTo', 'reactHow', 'replyHow', 'commandTags'].forEach(dir => {
      this.readFolderContents(dir);
    });
  }

  getConfigData() {
    return this.configData;
  }
}

class BaseInteract {
  constructor() {}

  // Common matching function to find regex in the message content
  findMatch(msg, regexArray) {
    const messageContent = msg.content.toLowerCase();
    const matchingRegex = regexArray.find(r => `${messageContent}`.match(r));
    if (matchingRegex) {
      return ` ${messageContent} `.match(matchingRegex);
    }
    return null;
}

  // This should be implemented by derived classes
  async processMatch(msg, match, responseArray) {
    throw new Error("This method should be implemented by the derived class");
}

  async interact(msg, triggerArray, responseArray) {
    const match = this.findMatch(msg, triggerArray);
    if (match) {
        return await this.processMatch(msg, match, responseArray);
    }
    return false;
  }

  //Specials in this context are placeholders you can add to your replies
  //There are 3 types of Specials: $match$, $person$ and $author$
  async replaceSpecials(msg, match, drawnReply) {

    let namePart;
    if (match[0].startsWith("!")) {
      const parts = msg.content.replace(match[0], '').trim();  // Just get the remainder of the message after the match.
      namePart = parts || msg.author.username;  // Use the remainder or default to the author's username.
      match[0] = match[0].slice(1);
    } else {
      namePart = msg.author.username;
    }

    const replacements = {
      "$match$": match[0],
      "$person$": namePart.charAt(0).toUpperCase() + namePart.slice(1),
      "$author$": msg.author.username
    };
  
    for (const [key, value] of Object.entries(replacements)) {
      drawnReply = drawnReply.split(key).join(value);
    }
    return drawnReply;
  }

}

class ReactInteract extends BaseInteract {
  async processMatch(msg, match, reactHowArray) {
    const randomReaction = reactHowArray[Math.floor(Math.random() * reactHowArray.length)];
    for (const el of randomReaction) {
      await sleep(600);
      await msg.react(el);
    }
    return true;
  }
}

//Is the same as ReplyInteract BUT will be changed and expanded upon in the future
class TagInteract extends BaseInteract {
  async processMatch(msg, match, replyHowArray) {
    let randomReply = replyHowArray[Math.floor(Math.random() * replyHowArray.length)];

    for (let item of randomReply) {
      item = await this.replaceSpecials(msg, match, item);
      item = item[0].toUpperCase() + item.substr(1);
      await sendTypingAndMessage(msg, item);
      return true;
    }
    return false;
  }
}

class ReplyInteract extends BaseInteract {
  async processMatch(msg, match, replyHowArray) {
    let randomReply = replyHowArray[Math.floor(Math.random() * replyHowArray.length)];

    for (let item of randomReply) {
      item = await this.replaceSpecials(msg, match, item);
      item = item[0].toUpperCase() + item.substr(1);
      await sendTypingAndMessage(msg, item);
      return true;
    }
    return false;
  }
}

async function sendTypingAndMessage(msg, messageContent) {
  msg.channel.startTyping();
  await sleep(1200);
  msg.channel.send(messageContent);
  msg.channel.stopTyping();
}

const loader = new ConfigLoader('config');
loader.load();
const configData = loader.getConfigData();

const client = new Discord.Client();

const reactInteractor = new ReactInteract();
const replyInteractor = new ReplyInteract();
const tagInteractor = new TagInteract();

//Message handling
client.on('message', async msg => {
  if (msg.author.bot) {
      return;
  }

  let hasInteracted = false;
  
  const interactionTypesOrder = ['react', 'tag', 'reply'];
  for (const interactionType of interactionTypesOrder) {
      for (const interaction of interactions.interactions) {
          if (interaction.type !== interactionType) continue;

          let queryDeclared = [];
          let replyDeclared = [];

          //Fill queryDeclared with regexes
          if (interaction.type === 'tag') {
            for (let queryKey of interaction.queries) { 
              if (configData.commandTags[queryKey]) { 
                queryDeclared = [...queryDeclared, ...configData.commandTags[queryKey]];
              }
            }
          } else if (interaction.type === 'react' || interaction.type === 'reply') {
            for (let queryKey of interaction.queries) {
              if (configData.reactReplyTo[queryKey]) { 
                queryDeclared = [...queryDeclared, ...configData.reactReplyTo[queryKey]];

              }
            }
          }

          //Fill replyDeclared with replies or reactions
          if (interaction.type === 'react') {
            for (let reactKey of interaction.replies) {
              if (configData.reactHow[reactKey]) {
                replyDeclared = [...replyDeclared, ...configData.reactHow[reactKey]];
              }
            }
          } else if (interaction.type === 'tag') {
            for (let tagKey of interaction.replies) {
              if (configData.replyHow[tagKey]) {
                replyDeclared = [...replyDeclared, ...configData.replyHow[tagKey]];
              } else if (configData.reactHow[tagKey]) {
                replyDeclared = [...replyDeclared, ...configData.reactHow[tagKey]];
              }
            }
          } else if (interaction.type === 'reply') {
            for (let replyKey of interaction.replies) {
              if (configData.replyHow[replyKey]) {
                replyDeclared = [...replyDeclared, ...configData.replyHow[replyKey]];
              }
            }
          }

          if (interaction.type === 'react') {
            reactInteractor.interact(msg, queryDeclared, replyDeclared);
          } else if (interaction.type === 'tag') {
            hasInteracted = await tagInteractor.interact(msg, queryDeclared, replyDeclared) || hasInteracted;
          } else if (interaction.type === 'reply') {
            hasInteracted = await replyInteractor.interact(msg, queryDeclared, replyDeclared) || hasInteracted;
          }
      }
      if (hasInteracted) return; // Exit if an interaction was found.
  }
});

console.log('React-reply-bot initialized');
client.login(process.env.DISCORD_BOT_TOKEN);