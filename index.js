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
  // ... [rest of the InteractWith class remains unchanged]
}

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
