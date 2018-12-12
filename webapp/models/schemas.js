var vogels = require('vogels');
var Joi = require('joi');
vogels.AWS.config.loadFromPath('./config.json');

var Friendships = vogels.define('Friendship', {
  hashKey : 'user1',
  rangeKey: 'user2',
  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
  
  schema : {
    user1   : Joi.string(), // hash key
    user2   : Joi.string(), // Need to make sort keu
    status  : Joi.string(), // Outgoing, Incoming, Friend
  },
  indexes : [{
    hashKey : 'user1', rangeKey : 'status', type : 'local', name : 'StatusIndex'
  }]
});
exports.Friendships = Friendships;

var RecommendedFriends = vogels.define('RecommendedFriend', {
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
exports.RecommendedFriends = RecommendedFriends;

var Users = vogels.define('User', {
  hashKey : 'username',
 
  // add the timestamp attributes (updatedAt, createdAt)
  timestamps : true,
 
  schema : {
    username  : Joi.string(),
    password  : Joi.string(),
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
exports.Users = Users;

var Posts = vogels.define('Post', {
  hashKey: 'pID',

  timestamps : true,

  schema : {
    pID : vogels.types.uuid(),
    content : Joi.string(),
    username  : Joi.string(), // Poster
    likes : Joi.number(),
    type: Joi.string(), // Encodes Status or Update for rendering
  }
});
exports.Posts = Posts;

var PostComments = vogels.define('PostComment', {
  hashKey: 'pID',
  rangeKey: 'createdAt',

  timestamps: true,
  schema: {
    pID: vogels.types.uuid(),
    username: Joi.string(),
    data: Joi.string(),
    likes: Joi.number(),
  }
});
exports.PostComments = PostComments;

var Wall = vogels.define('Wall', {
  hashKey : 'username',
  rangeKey: 'createdAt',

  schema  : {
    username  : Joi.string(), // Receiver (who's wall its being posted to)
    createdAt : Joi.date(),
    pID : vogels.types.uuid(),
  }
});
exports.Wall = Wall;

var Affiliations = vogels.define('Affiliation', {
  hashKey: 'affiliation',
  rangeKey: 'username',

  schema : {
    affiliation: Joi.string(),
    username: Joi.string(),
  }
});
exports.Affiliations = Affiliations;

var Interests2User = vogels.define('Interests2User', {
  hashKey: 'interests',
  rangeKey: 'username',

  schema : {
    interests: Joi.string(),
    username: Joi.string(),
  }
});
exports.Interests2User = Interests2User;

var User2Interests = vogels.define('User2Interest', {
  hashKey: 'username',
  rangeKey: 'interests',

  schema : {
    interests: Joi.string(),
    username: Joi.string(),
  }
});
exports.User2Interests = User2Interests;

var Chat2User = vogels.define('Chat2User', {
  hashKey: 'chatID',
  rangeKey: 'username',

  schema : {
    chatID: vogels.types.uuid(),
    username: Joi.string(),
  },
});
exports.Chat2User = Chat2User;

var User2Chat = vogels.define('User2Chat', {
  hashKey: 'username',
  rangeKey: 'chatID',

  schema : {
    chatID: vogels.types.uuid(),
    username: Joi.string(),
  }
});
exports.User2Chat = User2Chat;

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
exports.ChatData = ChatData;

var PostLikes = vogels.define('PostLike', {
  hashKey: 'pID',
  rangeKey: 'username',

  timestamps: true,

  schema : {
    pID: vogels.types.uuid(),
    username: Joi.string()
  }
});
exports.PostLikes = PostLikes;

