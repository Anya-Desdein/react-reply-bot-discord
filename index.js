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


class InteractWith {
  //reply by writing a message
  async reply(msg, replyToArray, replyHowArray) {
    // Sort the replyToArray by string length in descending order
    const sortedReplyToArray = [...replyToArray].sort((a, b) => b.toString().length - a.toString().length);
    
    const matchingRegexArray = sortedReplyToArray.find(r => ` ${msg.content} `.match(r));
    if (matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      if (match) {
        let randomReply = replyHowArray[Math.floor(Math.random() * replyHowArray.length)];
        for (let item of randomReply) {
          item = item
            .replace('$author$', msg.author.username)
            .replace('$match$', match[1]);
          item = item[0].toUpperCase() + item.substr(1);
          msg.channel.startTyping();
          await sleep(1600);
          msg.channel.send(item);
          msg.channel.stopTyping();
          return true;
        }
      }
    }
    return false;
}

  async replyTag(msg, replyToArray, replyHowArray) {
    const sortedReplyToArray = [...replyToArray].sort((a, b) => b.toString().length - a.toString().length);
    const matchingRegexArray = sortedReplyToArray.find(r => msg.content.match(r));
    if (matchingRegexArray) {
      const match = msg.content.match(matchingRegexArray);
      if (match && match[0]) {
        let randomReply = replyHowArray[Math.floor(Math.random() * replyHowArray.length)];
        for (let item of randomReply) {
          // Split message by the matched trigger phrase, and remove empty strings
          console.log(match);
          const parts = msg.content.split(match[0]).filter(Boolean);

          let namePart;
          if (match[0].startsWith("!")) {
            // If the matched phrase starts with '!', use the rest of the message or author's name if no text is present
            if (parts.length === 0) {
              namePart = msg.author.username;
            } else {
              namePart = parts.join(' ').replace(/\s+/g, " ").trim();
            }
          } else {
            // Else, use the sender's username
            namePart = msg.author.username;
          }

          // Compose the response
          item = item.replace('$person$', namePart);
          item = item[0].toUpperCase() + item.substr(1);
          msg.channel.startTyping();
          await sleep(1600);
          msg.channel.send(item);
          msg.channel.stopTyping();
          return true;
        }
      }
    }
    return false;
  }


  //react by using an emoticon, picks random reaction from reactions array, reacts with it.
  react(msg, reactToArray, reactHowArray) {
    const matchingRegexArray = reactToArray.find(r => ` ${msg.content} `.match(r));
    if (matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      if (match) {
        const randomReaction = reactHowArray[Math.floor(Math.random() * reactHowArray.length)];
        randomReaction.forEach(el => msg.react(el));
      }
    }
  }

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

  const curseBot01 = new InteractWith();

  curseBot01.react(msg, sexQueryDeclared, sexReplyDeclared);

  hasInteracted = await curseBot01.reply(msg, helloQueryDeclared, helloReplyDeclared) || hasInteracted;
  if (hasInteracted) return; // Break out if a reply/reaction was made

  hasInteracted = await curseBot01.replyTag(msg, yourMomQueryDeclared, yourMomReplyDeclared) || hasInteracted;
  if (hasInteracted) return;

  hasInteracted = await curseBot01.replyTag(msg, loveQueryDeclared, loveReplyDeclared) || hasInteracted;
  if (hasInteracted) return;
});

console.log('React-reply-bot initialized');
client.login(process.env.DISCORD_BOT_TOKEN);

