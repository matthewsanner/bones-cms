const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user')

const getComments = async (req, res) => {
  const comments = await Comment.find().sort("-date");
  console.log(comments)
}

const createComment = async (req, res) => {
  const comment = new Comment ({
    content: req.body.content,
    date: new Date(),
    postID: req.body.postID,
    userID: req.body.userID
  })
}

