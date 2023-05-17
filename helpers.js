function addHashtagLinks(content) {
  const hashtagRegex = /#\w+\b/g;
  return content.replace(hashtagRegex, (match) => {
    return `<a href="/posts/hashtags/${match.substring(1)}">${match}</a>`;
  });
}

module.exports = {
  addHashtagLinks,
};
