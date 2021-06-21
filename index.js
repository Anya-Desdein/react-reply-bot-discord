const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const reactReplyTo = {};
const reactHow = {};
const replyHow = {};


function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

//"Read files"
const reactReplyToFile = fs.readdirSync('config/reactReplyTo/');
reactReplyToFile.forEach(file => {
  const extention = path.extname(file); 
  const fileName = path.basename(file, extention);
  reactReplyTo[fileName] = fs.readFileSync(path.join('config/reactReplyTo/', file), 'utf8')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(x => x.trim())
    .map( x => new RegExp(`\\s(${x})\\s`, 'i'));
  // console.log(reactReplyTo);
});

const fileReactHowFile = fs.readdirSync('config/reactHow/');
fileReactHowFile.forEach(file => {
  const extention = path.extname(file); 
  const fileName = path.basename(file, extention);
  reactHow[fileName] = JSON.parse(fs.readFileSync(path.join('config/reactHow/', file), 'utf8'))
  // console.log(reactHow);
});


const fileReplyHowFile = fs.readdirSync('config/replyHow/');
fileReplyHowFile.forEach(file => {
  const extention = path.extname(file); 
  const fileName = path.basename(file, extention);
  replyHow[fileName] = JSON.parse(fs.readFileSync(path.join('config/replyHow/', file), 'utf8'))
  // console.log(reactHow);
});


//Class Declarations
class InteractWith {

  checkIfMatch(msg, msgMatch) {
    if (msgMatch === "author") {
      return msg.author.username;
    }
    else if (msgMatch === "query") {
      return msg.content;
    }
  }

//reply by writing a message
  async reply(msg, replyToArray, replyHowArray, msgMatch) {
    const matchingRegexArray = replyToArray.find(r => ` ${msg.content} `.match(r));
    if(matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      if (match) {
        const matchResult = this.checkIfMatch(msg, msgMatch);
        let randomReply = replyHowArray[Math.floor(Math.random()*replyHowArray.length)];
        // console.log(randomReply, replyHowArray);
        for (let item of randomReply) {
          if (matchResult) {
            item = item.replace('$match$',matchResult);
          }
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
    if(matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      if (match) {
        const randomReaction = reactHowArray[Math.floor(Math.random()*reactHowArray.length)];
        randomReaction.forEach(el => msg.react(el));
      }
    }
  }
  
}

//Real code
const client = new Discord.Client();

client.on('ready', () => {
  // console.log(`Logged in as ${client.user.tag}!`);
});


client.on('raw', ({ op, t, d }) => {
  if(op !== 0) return;
  console.log(`\n>>>>>>PACKET ${t} >>>>>>> \n`, d, `\n<<<<<<<<<<<<\n`);
});


client.on('message', msg => {
  if(msg.channel.id !== '835632109300744262' && msg.channel.id !== '835568521312337980' && msg.channel.id !== '835579274865803325') {
    return;
  }
  if(msg.author.bot) {
    return;
  }


// Declare how you want to reply and react and to what
const sexQueryDeclared = [...reactReplyTo.sexListPl, ...reactReplyTo.sexListPl, ...reactReplyTo.sexListUniversal];
const sexReplyDeclared = [...reactHow.sexReactionUniversal];
const helloQueryDeclared = [...reactReplyTo.helloListPl, ...reactReplyTo.helloListUniversal];
const helloReplyDeclared = [...replyHow.helloRepliesPl];


  const curseBot01 = new InteractWith();
  curseBot01.react(msg, sexQueryDeclared, sexReplyDeclared);
  curseBot01.reply(msg, helloQueryDeclared, helloReplyDeclared, "query");
});

client.login('ODM1NTc3MTIwMjE0MDg5Nzc5.YIRd1Q.k-pDUvnJEfvjUbuQJbZSMp8PwmI');