const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const addHashtagLinks = require("../utilities/addHashtagLinks");

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort("-date");

    // Fetch usernames for each post
    const postsWithUsernames = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.author);
        const username = user ? user.username : "Unknown"; // Set a default username if user is not found
        return { ...post.toObject(), username };
      })
    );

    res.render("index", {
      posts: postsWithUsernames,
      addHashtagLinks: addHashtagLinks,
    });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.send("There was an error rendering the index page!");
  }
};

exports.findPost = async (req, res) => {
  // if req.params._id is favicon.ico then response immediately
  if (req.params.id === "favicon.ico") {
    return res.status(404);
  }
  const { id } = req.params;

  try {
    const post = await Post.findById(id);

    if (!post) {
      throw new Error("Post not found!");
    }

    const user = await User.findById(post.author);
    const comments = await Comment.find({ postID: post._id });
    const updatedComments = [];

    for (const comment of comments) {
      const user = await User.findById(comment.userID);
      const updatedComment = { ...comment._doc, username: user.username };
      updatedComments.push(updatedComment);
    }

    res.render("post", {
      post,
      user,
      comments: updatedComments,
      addHashtagLinks: addHashtagLinks,
    });
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/");
  }
};

exports.viewCreatePost = (req, res) => {
  res.render("createPost");
};

exports.createPost = async (req, res) => {
  const hashtagArray = (content) => {
    // Match all words starting with '#' and followed by any non-space character
    const hashtagRegex = /#\w+\b/g;

    // Extract all the hashtags from the post content
    const hashtags = content.match(hashtagRegex);

    // If no hashtags are found, return an empty array
    if (!hashtags) {
      return [];
    }

    // Remove the '#' symbol from each hashtag and return the result
    return hashtags.map((hashtag) => hashtag.substring(1));
  };

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    hashtags: hashtagArray(req.body.content),
    author: req.user._id,
  });

  try {
    await post.save();
    req.flash("success", "Post created successfully!");
    res.redirect("/");
  } catch {
    console.error(error);
    req.flash("error", error.message);
    res.redirect("/");
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    await Post.findByIdAndDelete(id);
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect(`/${id}`);
  }
};

exports.viewEditPost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);

    if (!post) {
      throw new Error("The post with the given ID was not found");
    }

    // If the post is found, render the view page with the post's information
    res.render("edit", { post });
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect("/");
  }
};

exports.editPost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body.post;

  const hashtagArray = (content) => {
    // Match all words starting with '#' and followed by any non-space character
    const hashtagRegex = /#\w+\b/g;

    // Extract all the hashtags from the post content
    const hashtags = content.match(hashtagRegex);

    // If no hashtags are found, return an empty array
    if (!hashtags) {
      return [];
    }

    // Remove the '#' symbol from each hashtag and return the result
    return hashtags.map((hashtag) => hashtag.substring(1));
  };

  const updatedPost = {
    title,
    content,
    hashtags: hashtagArray(content),
  };

  try {
    const post = await Post.findByIdAndUpdate(id, updatedPost, { new: true });

    if (!post) {
      throw new Error("The post with the given ID was not found");
    }

    req.flash("success", "The post was updated successfully!");
    res.redirect(`/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", err.message);
    res.redirect(`/${id}`);
  }
};

exports.getHashtag = async (req, res) => {
  const { hashtag } = req.params;
  try {
    // Search for posts with the specified hashtag in the database
    const posts = await Post.find({ hashtags: hashtag }).sort("-date");

    const postsWithUsernames = await Promise.all(
      posts.map(async (post) => {
        const user = await User.findById(post.author);
        const username = user ? user.username : "Unknown"; // Set a default username if user is not found
        return { ...post.toObject(), username };
      })
    );

    // Render the view page with the list of posts containing the hashtag
    res.render("hashtag", {
      hashtag,
      posts: postsWithUsernames,
      addHashtagLinks: addHashtagLinks,
    });
  } catch {
    console.error(err);
    req.flash("error", err.message);
    res.redirect(`/hashtags/${hashtag}`);
  }
};
