let express = require('express');
const router = express.Router();
const commentController = require('../controllers/comments');

router.get('/comments', commentController.getComments)