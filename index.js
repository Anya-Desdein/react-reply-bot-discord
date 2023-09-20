const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const interactions= require('./interactions');

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
      const lines = fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8').split('\n');
      if (dir === 'reactReplyTo') {
        // Read line by line, trim whitespace, and convert to RegExp
        reactReplyTo[fileName] = lines.map(line => new RegExp(line.trim()));
      }
      if (dir === 'commandTags') {
        // Read line by line, trim whitespace, and convert to RegExp
        commandTags[fileName] = lines.map(line => new RegExp("!" + line.trim()));
      }
    } else if (extension === '.json') {
      const jsonData = JSON.parse(fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8'));
      if (dir === 'reactHow') reactHow[fileName] = jsonData;
      if (dir === 'replyHow') replyHow[fileName] = jsonData;
    }
  });
  console.log(commandTags);
});

class BaseInteract {
  constructor() {
  }

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

class TagInteract extends BaseInteract {
  async processMatch(msg, match) {
    console.log(match);
    const tag = match[0];
    for (const interaction of interactions) {
      if (interaction.type === 'tag' && interaction.values.includes(tag)) {
        const randomReply = interaction.replies[Math.floor(Math.random() * interaction.replies.length)];
        const namePart = msg.author.username;
        let item = randomReply.replace('$person$', namePart);
        item = item[0].toUpperCase() + item.substr(1);
        await sendTypingAndMessage(msg, item);
        return true;
      }
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

class ReactInteract extends BaseInteract {
  async processMatch(msg, match, reactHowArray) {
    const randomReaction = reactHowArray[Math.floor(Math.random() * reactHowArray.length)];
    for (const el of randomReaction) {
      await msg.react(el);
    }
    return true;
  }
}

async function sendTypingAndMessage(msg, messageContent) {
  msg.channel.startTyping();
  msg.channel.send(messageContent);
  msg.channel.stopTyping();
}

const client = new Discord.Client();

const reactInteractor = new ReactInteract();
const replyInteractor = new ReplyInteract();
const tagInteractor = new TagInteract();

client.on('message', async msg => {
  if (msg.author.bot) {
    return;
  }
  // console.log(`Received message: ${msg.content}`);
  let hasInteracted = false;
  
  for (let interaction of interactions.interactions) {  
    // Access the interactions array from interactions.js
    let queryDeclared = [];
    let replyDeclared = [];
    

      for (let queryKey of interaction.queries) {
        if (reactReplyTo[queryKey]) { // Check if the queryKey exists in reactReplyTo
          queryDeclared = [...queryDeclared, ...reactReplyTo[queryKey]];
          // console.log(typeof queryDeclared);
          
        }
      }
  
      for (let replyKey of interaction.replies) {
        if (reactHow[replyKey]) {
          replyDeclared = [...replyDeclared, ...reactHow[replyKey]];
        } else if (replyHow[replyKey]) {
          replyDeclared = [...replyDeclared, ...replyHow[replyKey]];
        }
      }
  
      if (interaction.type === 'tag') {
        console.log("Processing a react interaction");
        reactInteractor.interact(msg, queryDeclared, replyDeclared);
        console.log(hasInteracted);
      }else if (interaction.type === 'react') {
        console.log("Processing a tag interaction");
        hasInteracted = await tagInteractor.interact(msg, queryDeclared, replyDeclared) || hasInteracted;
        console.log(hasInteracted);
      } else if (interaction.type === 'reply') {
        console.log("Processing a reply interaction");
        hasInteracted = await replyInteractor.interact(msg, queryDeclared, replyDeclared) || hasInteracted;
        console.log(hasInteracted);
      } 
      
      if (hasInteracted) return; 

  }
});

// console.log('React-reply-bot initialized');
client.login(process.env.DISCORD_BOT_TOKEN);