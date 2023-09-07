const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const disbut = require('discord-buttons');

const reactReplyTo = {};
const reactHow = {};
const replyHow = {};
const roles = {};


function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Read files
['reactReplyTo', 'reactHow', 'replyHow', 'roles'].forEach(dir => {
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
        if (dir === 'roles') roles[fileName] = jsonData;
      }
    }
  });
});

async function deleteRole(clMember, clRole) {
  await clMember.roles.remove(clRole);
}

class RoleMaker {
  constructor() {
    this.roleArray = [];
  }

  createButton(el, color) {
    const newId = `${el[0]}_${el[1]}`;
    const elCreated = new disbut.MessageButton()
      .setLabel(el[0])
      .setStyle(color)
      .setEmoji(el[1])
      .setID(newId);
    this.roleArray.push(elCreated);
  }

  sendRoleArrayToChannel(roleChannel) {
    const roleRows = [];
    for (let i = 0; i < this.roleArray.length; i += 5) {
      const actionRow = new disbut.MessageActionRow();
      for (let j = i; j < i + 5 && j < this.roleArray.length; j++) {
        actionRow.addComponent(this.roleArray[j]);
      }
      roleRows.push(actionRow);
    }
    roleRows.forEach(row => roleChannel.send("⠀", { components: [row] }));
  }

  checkOne(clickedMember, rolefile) {
    const userRoles = clickedMember.roles.cache;
    userRoles.each(role => {
      const roleNameArray = roles[rolefile].map(r => r[0]);
      if (roleNameArray.includes(role.name)) {
        deleteRole(clickedMember, role.id);
      }
    });
  }
}

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

const client = new Discord.Client();
disbut(client);

client.on('ready', () => {
  const myGuild1 = client.guilds.cache.get('835568453649170472');
  const roleChannel = myGuild1.channels.cache.get('858001836410011658');
  const roleManager = new RoleMaker();

  roles.colorRolesPl.forEach(el => roleManager.createButton(el, "grey"));
  roleManager.sendRoleArrayToChannel(roleChannel);

  client.on('clickButton', async (myButton) => {
    const [roleFinder] = myButton.id.split("_");
    const clickedMember = myButton.clicker.member;
    const role = myGuild1.roles.cache.find(r => r.name === roleFinder);

    roleManager.checkOne(clickedMember, 'colorRolesPl');

    clickedMember.roles.add(role);
    await myButton.reply.send(`Wybrałeś kolor: ${roleFinder}`);
  });
});

client.on('message', msg => {
  if (msg.channel.id !== '835632109300744262' && msg.channel.id !== '835568521312337980' && msg.channel.id !== '835579274865803325') {
    return;
  }
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
