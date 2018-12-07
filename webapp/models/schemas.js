var vogels = require('vogels');
vogels.AWS.config.loadFromPath('../config.json');

var Friendships = vogels.define('Friendships', {
  hashKey : 'user1',
  rangeKey: 'user2',
  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
  
  schema : {
    user1   : Joi.string(), // hash key
    user2   : Joi.string(), // Need to make sort keu
    status  : Joi.string(), // Outgoing, Incoming, Friend
  }
});

var RecommendedFriends = vogels.define('RecommendedFriends', {
  hashKey : 'user1',
  rangeKey: 'user2',
  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
  
  schema : {
    user1   : Joi.string(), // hash key
    user2   : Joi.string(), // Need to make sort keu
    strength  : Joi.number(), // Outgoing, Incoming, Friend
  }
});

var User = vogels.define('User', {
  hashKey : 'username',
 
  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
 
  schema : {
    username  : Joi.string(),
    firstName : Joi.string(),
    lastName  : Joi.string(),
    birthday  : Joi.number(),
    affiliation : Joi.string(),
    permissions : Joi.number(), // Encode's what level of access a user has

    // settings : {
    //   nickname      : Joi.string(),
    //   acceptedTerms : Joi.boolean().default(false)
    // }
  }
});

var Statuses = vogels.define('Statuses', {
  hashKey: 'sID',

  timestamps : true,

  schema : {
    sID : vogels.types.uuid(),
    content : Joi.string(),
    username  : Joi.string(), // Poster
  }
});

var Wall = vogels.define('Wall', {
  hashKey : 'username',
  rangeKey : 'sID',

  schema  : {
    username  : Joi.string(), // Receiver (who's wall its being posted to)
    sID : vogels.types.uuid(),
  }
});

var StatusComments = vogels.define('StatusComments', {
  hashKey: 'sID',
  rangeKey: 'createdAt'

  timestamps: true,
  schema: {
    sID: vogels.types.uuid(),
    username: Joi.string(),
    data: Joi.string(),
  }
});

var Affiliations = vogels.define('Affiliations', {
  hashKey: 'affiliation',
  rangeKey: 'username',

  schema : {
    affiliation: Joi.string(),
    username: Joi.string(),
  }
});

var Interests2User = vogels.define('Interests2User', {
  hashKey: 'interests',
  rangeKey: 'username',

  schema : {
    interests: Joi.string(),
    username: Joi.string(),
  }
});

var User2Interests = vogels.define('User2Interests', {
  hashKey: 'username',
  rangeKey: 'interests',

  schema : {
    interests: Joi.string(),
    username: Joi.string(),
  }
});

var Chat2User = vogels.define('Chat2User', {
  hashKey: 'chatID',
  rangeKey: 'username',

  schema : {
    chatID: vogels.types.uuid(),
    username: Joi.string(),
  }
});

var User2Chat = vogels.define('User2Chat', {
  hashKey: 'username',
  rangeKey: 'chatID',

  schema : {
    chatID: vogels.types.uuid(),
    username: Joi.string(),
  }
});

var ChatData = vogels.define('ChatData', {
  hashKey: 'chatID',
  rangeKey: 'createdAt',

  timestamps: true,

  schema : {
    chatID: vogels.types.uuid(),
    data: Joi.string(),
    username: Joi.string(),
  }
});