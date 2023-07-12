let express = require('express');
const router = express.Router();
router.use(express.json());
const postController = require('../controllers/posts');
const catchAsync = require('../utilities/catchAsync');
const isLoggedIn = require('../utilities/isLoggedIn');
const isAuthor = require('../utilities/isAuthor');

router.get('/', catchAsync(postController.getPosts));
router.get('/create-post', isLoggedIn, postController.viewCreatePost);
router.post('/create-post', isLoggedIn, catchAsync(postController.createPost));
// this should be a delete route, fix later
router.get('/delete/:id', isLoggedIn, isAuthor, catchAsync(postController.deletePost));
router.get('/edit/:id', isLoggedIn, isAuthor, catchAsync(postController.viewEditPost));
router.get('/hashtags/:hashtag', catchAsync(postController.getHashtag));
router.get('/:id', catchAsync(postController.findPost));
router.put('/:id', isLoggedIn, isAuthor, catchAsync(postController.editPost));

module.exports = router;