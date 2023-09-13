const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const reactReplyTo = {};
const reactHow = {};
const replyHow = {};

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Read files
['reactReplyTo', 'reactHow', 'replyHow'].forEach(dir => {
  const files = fs.readdirSync(`config/${dir}`);
  files.forEach(file => {
    const extension = path.extname(file);
    const fileName = path.basename(file, extension);
    if (dir === 'reactReplyTo') {
      if (extension === '.json' || extension === '.txt') {
        // For reactReplyTo files, read line by line, trim whitespace, and convert to RegExp
        const lines = fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8').split('\n');
        reactReplyTo[fileName] = lines.map(line => new RegExp(line.trim()));
      }
    } else if (extension === '.json') {
      const jsonData = JSON.parse(fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8'));
      if (dir === 'reactHow') reactHow[fileName] = jsonData;
      if (dir === 'replyHow') replyHow[fileName] = jsonData;
    }
  });
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


class TagInteract extends BaseInteract {
  async processMatch(msg, match, replyHowArray) {
    let randomReply = replyHowArray[Math.floor(Math.random() * replyHowArray.length)];
    for (let item of randomReply) {
      const parts = msg.content.split(match[0]).filter(Boolean);

      let namePart;
      if (match[0].startsWith("!")) {
        if (parts.length === 0) {
          namePart = msg.author.username;
        } else {
          namePart = parts.join(' ').replace(/\s+/g, " ").trim();
        }
      } else {
        namePart = msg.author.username;
      }

      item = item.replace('$person$', namePart);
      item = item[0].toUpperCase() + item.substr(1);
      await sendTypingAndMessage(msg, item);
      return true;
    }
    return false;
  }
}


class ReactInteract extends BaseInteract {
  processMatch(msg, match, reactHowArray) {
    const randomReaction = reactHowArray[Math.floor(Math.random() * reactHowArray.length)];
    randomReaction.forEach(el => msg.react(el));
    return true;
  }
}


async function sendTypingAndMessage(msg, messageContent) {
  msg.channel.startTyping();
  await sleep(1600);
  msg.channel.send(messageContent);
  msg.channel.stopTyping();
}

const client = new Discord.Client();

client.on('message', async msg => {
  if (msg.author.bot) {
    return;
  }

  let hasInteracted = false;

  // Declare how you want to reply and react and to what
  const sexQueryDeclared = [...reactReplyTo.sexListPl, ...reactReplyTo.sexListUniversal];
  const sexReplyDeclared = [...reactHow.sexReactionUniversal];
  const helloQueryDeclared = [...reactReplyTo.helloListPl, ...reactReplyTo.helloListUniversal];
  const helloReplyDeclared = [...replyHow.helloRepliesPl];
  const yourMomQueryDeclared = [...reactReplyTo.yourMomListPl];
  const yourMomReplyDeclared = [...replyHow.yourMomRepliesPl];
  const loveQueryDeclared = [...reactReplyTo.loveListPl, ...reactReplyTo.loveListEn];
  const loveReplyDeclared = [...replyHow.loveRepliesPl];

  const reactInteractor = new ReactInteract();
  const replyInteractor = new ReplyInteract();
  const tagInteractor = new TagInteract();

  reactInteractor.interact(msg, sexQueryDeclared, sexReplyDeclared);

  hasInteracted = await replyInteractor.interact(msg, helloQueryDeclared, helloReplyDeclared) || hasInteracted;
  if (hasInteracted) return; // Break out if a reply/reaction was made

  hasInteracted = await tagInteractor.interact(msg, yourMomQueryDeclared, yourMomReplyDeclared) || hasInteracted;
  if (hasInteracted) return;

  hasInteracted = await tagInteractor.interact(msg, loveQueryDeclared, loveReplyDeclared) || hasInteracted;
  if (hasInteracted) return;
});

console.log('React-reply-bot initialized');
client.login(process.env.DISCORD_BOT_TOKEN);

