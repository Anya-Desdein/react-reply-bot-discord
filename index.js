const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

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
    if (extension === '.json') {
      if (dir === 'reactReplyTo') {
        // For reactReplyTo files, read line by line, trim whitespace, and convert to RegExp
        const lines = fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8').split('\n');
        reactReplyTo[fileName] = lines.map(line => new RegExp(line.trim()));
      } else {
        const jsonData = JSON.parse(fs.readFileSync(path.join(`config/${dir}/`, file), 'utf8'));
        if (dir === 'reactHow') reactHow[fileName] = jsonData;
        if (dir === 'replyHow') replyHow[fileName] = jsonData;
      }
    }
  });
});

class InteractWith {
  //reply by writing a message
  async reply(msg, replyToArray, replyHowArray) {
    const matchingRegexArray = replyToArray.find(r => ` ${msg.content} `.match(r));
    if (matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      // console.log(match[1]);
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
        }
      }
    }
  }

  async replyTag(msg, replyToArray, replyHowArray) {
    const matchingRegexArray = replyToArray.find(r => ` ${msg.content} `.match(r));
    if (matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      // console.log(match[1]);
      if (match) {
        let randomReply = replyHowArray[Math.floor(Math.random() * replyHowArray.length)];
        for (let item of randomReply) {
          const personTag = msg.content.replace(match[1], '');
          // console.log(match[1][0]);
          if (match[1][0] === "!" && msg.content.indexOf(match[1]) === 0 && personTag) {
            item = item
              .replace('$person$', personTag)
          } else {
            item = item.replace('$person$', msg.author.username)
          }
          item = item[0].toUpperCase() + item.substr(1);
          msg.channel.startTyping();
          await sleep(1600);
          msg.channel.send(item);
          msg.channel.stopTyping();
        }
      }
    }
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

const curseBot01 = new InteractWith();
curseBot01.react(msg, sexQueryDeclared, sexReplyDeclared);
curseBot01.reply(msg, helloQueryDeclared, helloReplyDeclared);
curseBot01.replyTag(msg, yourMomQueryDeclared, yourMomReplyDeclared);
curseBot01.replyTag(msg, loveQueryDeclared, loveReplyDeclared);

const client = new Discord.Client();

client.on('message', msg => {
  if (msg.author.bot) {
    return;
  }

  // Declare how you want to reply and react and to what
  const sexQueryDeclared = [...reactReplyTo.sexListPl, ...reactReplyTo.sexListPl, ...reactReplyTo.sexListUniversal];
  const sexReplyDeclared = [...reactHow.sexReactionUniversal];
  const helloQueryDeclared = [...reactReplyTo.helloListPl, ...reactReplyTo.helloListUniversal];
  const helloReplyDeclared = [...replyHow.helloRepliesPl];
  const yourMomQueryDeclared = [...reactReplyTo.yourMomListPl];
  const yourMomReplyDeclared = [...replyHow.yourMomRepliesPl];
  const loveQueryDeclared = [...reactReplyTo.loveListPl, ...reactReplyTo.loveListEng];
  const loveReplyDeclared = [...replyHow.loveRepliesPl];

  const curseBot01 = new InteractWith();
  curseBot01.react(msg, sexQueryDeclared, sexReplyDeclared);
  curseBot01.reply(msg, helloQueryDeclared, helloReplyDeclared);
  curseBot01.replyTag(msg, yourMomQueryDeclared, yourMomReplyDeclared);
  curseBot01.replyTag(msg, loveQueryDeclared, loveReplyDeclared);
});

client.login('client_login_number');

