let express = require('express');
const router = express.Router();
router.use(express.json());
const catchAsync = require('../utilities/catchAsync');
const postController = require('../controllers/posts');
const { isLoggedIn, isAuthor } = require('../middleware');

router.get('/', catchAsync(postController.getPosts));
router.get('/:id', catchAsync(postController.findPost));
// this should be a delete route, fix later
router.get('/delete/:id', isLoggedIn, isAuthor, catchAsync(postController.deletePost));
router.get('/edit/:id', isLoggedIn, isAuthor, catchAsync(postController.viewEditPost));
router.put('/:id', isLoggedIn, isAuthor, catchAsync(postController.editPost));
router.get('/hashtags/:hashtag', catchAsync(postController.getHashtag));

module.exports = router;