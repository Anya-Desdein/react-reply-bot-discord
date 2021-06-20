const Discord = require('discord.js');
const client = new Discord.Client();

class InteractWith {

//reply by writing a message
  // reply(msg, reactToArray, replyHowArray) {
  //   const matchingRegexArray = reactToArray.find(r => ` ${msg.content} `.match(r));
  //   if(matchingRegexArray) {
  //     const match = ` ${msg.content} `.match(matchingRegexArray);
  //     if (match) {
  //       const randomReply = replyHowArray[Math.floor(Math.random()*replyHowArray.length)];
  //         msg.channel.startTyping();
  //         setTimeout(() => {
  //           msg.channel.send(randomReply);
  //           msg.channel.stopTyping();
  //         }, 1600);
  //   }
  // }
  // msg.channel.send(match[1] + ", a teraz wypierdalaj");

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

// const helloReactionPl = [
//   [$msgcontent$
// ];

const sexReactionUniversal = [
  ['🇸','🇪','🇽'],
  ['🍆','🍑'],
];

const sexReactionPl = [
  ['🇩','🇺','🇵','🇦']
];

const helloListPL = [
  /\s(dzi+e+[nń]\s*do+bry+)\s/i,
  /\s(e+l+o+)\s/i,
  /\s(si+e+mk?a*)\s/i,
  /\s(he+j+k?[ao]*)\s/i,
  /\s([jy]+o+)\s/i,
  /\s(si+e+ma+nk?o+)\s/i,
  /\s(e+lo+s[zh]ka*)\s/i,
  /\s(wi+ta+j(cie)?)\s/i,
  /\s(o+ha+[yj]o+u?)\s/i,
  /\s(do+bry+\swi+e+cz[óo]+r)\s/i,
  /\s(do+bry+)\s/i,
];

const helloListENG = [
  /\s(he+l+o+)\s/i,
  /\s(hi+)\s/i,
  /\s((go+d\s)?(morning|evening|afternoon))\s/i,
  /\s(ho+wdy+)\s/i,
  /\s(h+i+)\s/i,
  /\s(o+ha+[yj]o+u?)\s/i,
];

const sexListUniversal = [
  /\s(b+d+s+m+)\s/i,
  /\s(fe+de+(ryzm|r|rem)*)\s/i,
  /\s(blo+a+t(ing|er|erem)*)\s/i,
];

const sexListPL = [
  /\s(se+(x|ks)+y?)\s/i,
  /\s(ru+cha+ni+[eau]+)/i,
  /\s((za|wy)?ru+cha+[cć])\s/i,
  /\s(pi+e+rdo+l(eni[ea]|i[cć]?))\s/i,
  /\s(g(rz|ż)mo+ci+[ćc]?)\s/i,
  /\s(pi+e+p[rs]zy[cć]?)\s/i,
  /\s(pi+e+p[rs]ze+ni+e+)\s/i,
  /\s(du+p[ayęąeo]+)\s/i,
  /\s(cy+cki+)\s/i,
  /\s(z?gwa+[łl]ci+([cćłl]?|[łl]em|sz|my))\s/i,
  /\s(gwa+[łl]t)\s/i,
  /\s(z?gwa+[łl]c(on[aye]|enie))\s/i,
  /\s(du+p[ayęąeo]?)\s/i,
  /\s(ry+pa+(nie|[cć])?)\s/i,
  /\s(pi+e+rni+cz(enie|[yęe])?)\s/i,
  /\s(pi+wni+c[ayeęąa]?)\s/i,
  /\s(ko+pu+lo+wa+([cćłl]|[lł]eś|[łl]aś|no+)?)\s/i,
  /\s(bre+do+wa+([cćłl]|[lł][iy][śs]my+)?)\s/i,
  /\s(i+gra+szki+)\s/i,
  /\s(ku+ta+s([ya]|ik)*)\s/i,
  /\s([bp]e+ni+[sz]([ayu]|ie|em|ami)*)\s/i,
  /\s(py+to+ng[au]*)\s/i,
  /\s(po+pę+d(u+|e+m)?)\s/i,
  /\s(ka+ma+su+tr[aęeą]?)\s/i,
  /\s(te+\sspra+wy+)\s/i,
  /\s(ci+u+pci+a+(ni[eau]|[cć]))\s/i,
  /\s(chę+do+ż(eni[ea]|[ey])*)\s/i,
  /\s(pi+e+rsi+)\s/i,
  /\s(bi+u+st[uy]*)\s/i,
  /\s(bzy+ka+ni+[ea]+)\s/i,
  /\s(sp[óo]+[lł]ko+wa+ni+e+)\s/i,
  /\s(du+pcz(y+ć|e+ni+[aeu]+)?)\s/i,
  /\s(grzmo+[cć](ić|eni[ae])?)\s/i,
  /\s(po+su+wa+([cć]|ni[ea]|[łl])?)\s/i,
  /\s(za+p[łl]a+dni+a+[ćc])\s/i,
  /\s(wa+li+[cć])\s/i,
  /\s(ko+[nń](i[ae]m?))\s/i,
  /\s(ga+ng\sba+ng)\s/i,
  /\s(ci+p[aąęey]?)\s/i,
  /\s(fe+l+i+a+ti?o)\s/i,
  /\s(cu+n+i+l+i+ngu+s+)\s/i,
  /\s(mi+ne+tk?a)\s/i,
  /\s(pro+sty+tu+cja+)\s/i,
  /\s(pro+sty+tu+(tk[aioeęą]|cj[aąęei]|ji+)?)\s/i,
  /\s(a+na+l(e[km])?)\s/i,
  /\s(fi+u+t(ek|em|kiem)?)\s/i,
  /\s(c*h[uó]j(em|ami)*)\s/i,
  /\s(pa+ł[aęeą]*)\s/i,
  /\s(k[uó]ta+fo+n)\s/i,
  /\s(ku+[śs]k[eaęą])\s/i,
  /\s(si+u+si+a+k(iem|om|ami)*)\s/i,
  /\s(wa+c(ek|kiem|ami))\s/i,
  /\s(pi+si+o+r(e[mk])*)\s/i,
  /\s(kna+g[aąęe]*)\s/i,
  /\s(pi+p[aąęeo])\s/i,
  /\s(je+ba+[cćlł]([oa]|[ea]m)?)\s/i,
  /\s(pi+zd[ayęą]+)\s/i,
];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
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
  const curseBot01 = new InteractWith();
  curseBot01.react(msg, sexListPL, sexReactionUniversal);
  curseBot01.react(msg, sexListUniversal, sexReactionPl);

});

client.login('ODM1NTc3MTIwMjE0MDg5Nzc5.YIRd1Q.k-pDUvnJEfvjUbuQJbZSMp8PwmI');