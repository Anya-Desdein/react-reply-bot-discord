const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const disbut = require('discord-buttons');

const reactReplyTo = {};
const reactHow = {};
const replyHow = {};
const roles = {};
let fileRoleName;

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
    .map(x => new RegExp(`\\s(${x})\\s`, 'i'));
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

const fileRoles = fs.readdirSync('config/roles');
fileRoles.forEach(file => {
  const extention = path.extname(file); 
  const fileName = path.basename(file, extention);
  fileRoleName = fileName;
  roles[fileName] = JSON.parse(fs.readFileSync(path.join('config/roles/', file), 'utf8'))
  // console.log(roles);
});


async function deleteRole(clMember, clRole) {
  console.log("removing", clRole);
  await clMember.roles.remove(clRole); 
}

//Class Declarations

class RoleMaker {
  constructor() {
  this.roleArray = [];
  }
  createButton(el, roleChannel, file, color) {
    const addition = "_";
    const newId = file.concat(addition ,el[0]);
    // console.log(file);
    // console.log(el[0]);
    // console.log(el[1]);
    // console.log(newId);
    let elCreated = new disbut.MessageButton()
      .setLabel(el[0])
      .setStyle(color)
      .setEmoji(el[1])
      .setID(newId);

    this.roleArray.push(elCreated);
    // console.log(elCreated);
  }

  sendRoleArrayToChannel(roleChannel) {
    let i = 0;
    let j = 0;
    let roleRows = [];
    const arrayOfRows = [];
    this.roleArray.forEach(el => {
      if(i === 5){
        j++;
        i = 0;
      } 
      if(i === 0) {
        roleRows[j] = new disbut.MessageActionRow();
      }
      roleRows[j].addComponent(el);
      i++;
    })
    // console.log(roleRows);
    while (roleRows.length){
      roleChannel.send("⠀",{components: roleRows.splice(0, 5)});
    }
  }

  checkOne(clickedMember, rolefile, roleFinder) {
    const userRoles = clickedMember.roles.cache;
    userRoles.each( el => {
      const emote = el.name;
      const roleNameArray = [];
      roles[rolefile].forEach(elementRole => roleNameArray.push(elementRole[0]));
      const roleFound = roleNameArray.find(element => element === emote);
      console.log(roleFound, el.name);
      if (roleFound) {
        deleteRole(clickedMember, el.id);
      }
      });
  }

  deleteSelf(roleFound, roleFinder, clickedMember, el.id)) {
    if(roleFound === roleFinder) {
      console.log( "rolefinder: " ,roleFinder, roleFound);
      deleteRole(clickedMember, el.id);
    }
  }
}


class InteractWith {

//reply by writing a message
  async reply(msg, replyToArray, replyHowArray) {
    const matchingRegexArray = replyToArray.find(r => ` ${msg.content} `.match(r));
    if(matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      // console.log(match[1]);
      if (match) {
        let randomReply = replyHowArray[Math.floor(Math.random()*replyHowArray.length)];
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
    if(matchingRegexArray) {
      const match = ` ${msg.content} `.match(matchingRegexArray);
      // console.log(match[1]);
      if (match) {
        let randomReply = replyHowArray[Math.floor(Math.random()*replyHowArray.length)];
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
disbut(client);

client.on('ready', () => {
  // console.log(`Logged in as ${client.user.tag}!`);
});


client.on('raw', ({ op, t, d }) => {
  if(op !== 0) return;
  // console.log(`\n>>>>>>PACKET ${t} >>>>>>> \n`, d, `\n<<<<<<<<<<<<\n`);
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
const yourMomQueryDeclared = [...reactReplyTo.yourMomListPl];
const yourMomReplyDeclared = [...replyHow.yourMomRepliesPl];
const loveQueryDeclared = [...reactReplyTo.loveListPl,...reactReplyTo.loveListEng];
const loveReplyDeclared = [...replyHow.loveRepliesPl];


  const curseBot01 = new InteractWith();
  curseBot01.react(msg, sexQueryDeclared, sexReplyDeclared);
  curseBot01.reply(msg, helloQueryDeclared, helloReplyDeclared);
  curseBot01.replyTag(msg, yourMomQueryDeclared, yourMomReplyDeclared);
  curseBot01.replyTag(msg, loveQueryDeclared, loveReplyDeclared);
});

client.on('ready', async () => {
  const myGuild1 = await client.guilds.fetch('835568453649170472');
  const roleChannel = myGuild1.channels.cache.find(ch => ch.id === '858001836410011658');
  const roleManager = new RoleMaker();
  roles.colorRolesPl.forEach(el => roleManager.createButton(el, roleChannel, fileRoleName, "grey")); 
  roleManager.sendRoleArrayToChannel(roleChannel);
  if(roleChannel) {
    client.on('clickButton', async (myButton) => {
      console.log(myButton.id);
      const [roleFile, roleFinder] = myButton.id.split("_");
      console.log(roleFinder);
      const clickedMember = myButton.clicker.member;
      let role = myGuild1.roles.cache.find(r => r.name === roleFinder);
      roleManager.checkOne(clickedMember, roleFile, roleFinder);

      clickedMember.roles.add(role);
      await myButton.reply.send(`Wybrałeś kolor: ${roleFinder}`);
    });

  };
});



client.login('ODM1NTc3MTIwMjE0MDg5Nzc5.YIRd1Q.k-pDUvnJEfvjUbuQJbZSMp8PwmI');