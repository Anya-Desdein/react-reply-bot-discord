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
        queries: ['careTags'],
        replies: ['careRepliesPl']
      },
      {
        type: 'tag',
        queries: ['helloTags'],
        replies: ['helloRepliesPl']
      },
      {
        type: 'tag',
        queries: ['yourMomTags'],
        replies: ['yourMomRepliesPl']
      },
      // Add more interactions here...
    ]
  };
  