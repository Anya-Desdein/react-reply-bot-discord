const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const interactions = require('./interactions');

const commandTags = {};
const reactReplyTo = {};
const reactHow = {};
const replyHow = {};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Read files
['reactReplyTo', 'reactHow', 'replyHow', 'commandTags'].forEach(dir => {
  const files = fs.readdirSync(`config/${dir}`);
  files.forEach(file => {
      const extension = path.extname(file);
      const fileName = path.basename(file, extension);
      if (extension === '.txt') {
        const lines = fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8')
        .split('\n')
        .filter(line => line.trim());

          if (dir === 'reactReplyTo') {
            reactReplyTo[fileName] = lines.map(line => new RegExp(line));
          }
          if (dir === 'commandTags') {
            commandTags[fileName] = lines.map(line => new RegExp("!" + line.trim()));
          }
      } else if (extension === '.json') {
        const jsonData = JSON.parse(fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8'));
        if (dir === 'reactHow') reactHow[fileName] = jsonData;
        if (dir === 'replyHow') replyHow[fileName] = jsonData;
      }
  });
});

class BaseInteract {
  constructor() {}

  // Common matching function to find regex in the message content
  findMatch(msg, regexArray) {
    const sortedRegexArray = [...regexArray].sort((a, b) => b.toString().length - a.toString().length);
    const matchingRegex = sortedRegexArray.find(r => `${msg.content}`.match(r));
    if (matchingRegex) {
      return ` ${msg.content} `.match(matchingRegex);
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
  }

class ReactInteract extends BaseInteract {
  async processMatch(msg, match, reactHowArray) {
    const randomReaction = reactHowArray[Math.floor(Math.random() * reactHowArray.length)];
    for (const el of randomReaction) {
      sleep(600);
      await msg.react(el);
    }
    return true;
  }
}
  
class TagInteract extends BaseInteract {
  async processMatch(msg, match, replyHowArray) {
    const tag = match[0];
      let randomReply = replyHowArray[Math.floor(Math.random() * replyHowArray.length)];
      for (let item of randomReply) {
        item = item
          .replace('$author$', msg.author.username)
          .replace('$match$', match[1]);
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
      item = item
        .replace('$author$', msg.author.username)
        .replace('$match$', match[1]);
      item = item[0].toUpperCase() + item.substr(1);
      await sendTypingAndMessage(msg, item);
      return true;
    }
    return false;
  }
}

async function sendTypingAndMessage(msg, messageContent) {
  sleep(1600);
  msg.channel.startTyping();
  msg.channel.send(messageContent);
  msg.channel.stopTyping();
}

const client = new Discord.Client();

const reactInteractor = new ReactInteract();
const replyInteractor = new ReplyInteract();
const tagInteractor = new TagInteract();

//Message handling
client.on('message', async msg => {
  if (msg.author.bot) {
      return;
  }
  console.log(`Received message: ${msg.content}`);
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
              if (commandTags[queryKey]) { 
                queryDeclared = [...queryDeclared, ...commandTags[queryKey]];
              }
            }
          } else if (interaction.type === 'react' || interaction.type === 'reply') {
            for (let queryKey of interaction.queries) {
              if (reactReplyTo[queryKey]) { 
                queryDeclared = [...queryDeclared, ...reactReplyTo[queryKey]];
              }
            }
          }

          //Fill replyDeclared with replies or reactions
          if (interaction.type === 'react') {
            for (let reactKey of interaction.replies) {
              if (reactHow[reactKey]) {
                replyDeclared = [...replyDeclared, ...reactHow[reactKey]];
              }
            }
          } else if (interaction.type === 'tag') {
            for (let tagKey of interaction.replies) {
              if (replyHow[tagKey]) {
                replyDeclared = [...replyDeclared, ...replyHow[tagKey]];
              } else if (reactHow[tagKey]) {
                replyDeclared = [...replyDeclared, ...reactHow[tagKey]];
              }
            }
          } else if (interaction.type === 'reply') {
            for (let replyKey of interaction.replies) {
              if (replyHow[replyKey]) {
                replyDeclared = [...replyDeclared, ...replyHow[replyKey]];
              }
            }
          }

          if (interaction.type === 'react') {
            console.log("Processing a react interaction");
            reactInteractor.interact(msg, queryDeclared, replyDeclared);
            console.log(hasInteracted);
          } else if (interaction.type === 'tag') {
            console.log("Processing a tag interaction");
            hasInteracted = await tagInteractor.interact(msg, queryDeclared, replyDeclared) || hasInteracted;
            console.log(hasInteracted);
          } else if (interaction.type === 'reply') {
            console.log("Processing a reply interaction");
            hasInteracted = await replyInteractor.interact(msg, queryDeclared, replyDeclared) || hasInteracted;
            console.log(hasInteracted);
          }
      }
      if (hasInteracted) return; // Exit if an interaction was found.
  }
});

console.log('React-reply-bot initialized');
client.login(process.env.DISCORD_BOT_TOKEN);