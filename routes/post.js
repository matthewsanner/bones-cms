let express = require("express");
const router = express.Router();
router.use(express.json());
const postController = require("../controllers/posts");
const isLoggedIn = require("../utilities/isLoggedIn");
const isAuthor = require("../utilities/isAuthor");

router.get("/", postController.getPosts);
router.get("/create-post", isLoggedIn, postController.viewCreatePost);
router.post("/create-post", isLoggedIn, postController.createPost);
// this should be a delete route, fix later
router.get("/delete/:id", isLoggedIn, isAuthor, postController.deletePost);
router.get("/edit/:id", isLoggedIn, isAuthor, postController.viewEditPost);
router.get("/hashtags/:hashtag", postController.getHashtag);
router.get("/:id", postController.findPost);
router.put("/:id", isLoggedIn, isAuthor, postController.editPost);

module.exports = router;
