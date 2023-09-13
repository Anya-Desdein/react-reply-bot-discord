// interactions.js

module.exports = {
    interactions: [
      {
        type: 'react',
        queries: ['sexListPl', 'sexListUniversal'],
        replies: ['sexReactionUniversal']
      },
      {
        type: 'reply',
        queries: ['helloListPl', 'helloListUniversal'],
        replies: ['helloRepliesPl']
      },
      {
        type: 'reply',
        queries: ['yourMomListPl'],
        replies: ['yourMomRepliesPl']
      },
      {
        type: 'tag',
        values: ['love'],
        replies: ['careRepliesPl']
      },
      {
        type: 'tag',
        values: ['cześć', 'hej', 'siemka', 'siema'],
        replies: ['helloRepliesPl']
      },
      {
        type: 'tag',
        values: ['+t[wf][oóu]+j[ąa]*\s+sta+r([ąay]|ej|[ąoę]m)+'],
        replies: ['yourMomRepliesPl']
      },
      // Add more interactions here...
    ]
  };
  