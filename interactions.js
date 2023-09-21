// Create relationships between files in order for reactions/replies/tags to work
// Allowed types are: react, reply, tag

// Querries are lists of words or sentences we're going to compare with user input. They're stored in reactReplyTo or commandTags directory depending on their type.
// Replies are lists of words or sentences, or emojis this bot will use to interact with a user. They're stored in replyHow and reactHow directories.

// commandTags and reactReplyTo =  .txt
// reactHow and replyHow = .json


module.exports = {
    interactions: [
      {
        type: 'react',
        queries: ['sexListPl', 'sexListUniversal'],
        replies: ['sexReactionUniversal']
      },
      {
        type: 'reply',
        queries: ['helloListPl', 'helloListUniversal', 'helloListEn'],
        replies: ['helloRepliesPl']
      },
      {
        type: 'reply',
        queries: ['yourMomListPl'],
        replies: ['yourMomRepliesPl']
      },
      {
        type: 'tag',
        queries: ['careTagsPl'],
        replies: ['careRepliesPl']
      },
      {
        type: 'tag',
        queries: ['helloTagsPl'],
        replies: ['helloRepliesPl']
      },
      {
        type: 'tag',
        queries: ['yourMomTagsPl'],
        replies: ['yourMomRepliesPl']
      },
      // Add more interactions here...
    ]
  };
  