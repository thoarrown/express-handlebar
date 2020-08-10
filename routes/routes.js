const fetch = require("isomorphic-unfetch");

module.exports = function (express, app, fs) {
  var router = express.Router();

  router.get("/", (req, res, next) => {
    res.render("home", {
      layout: req.isDomain.template ? req.isDomain.template : "main",
      posts: [
        {
          author: "Janith Kasun",
          image: "https://picsum.photos/500/500",
          comments: [
            "This is the first comment",
            "This is the second comment",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum nec fermentum ligula. Sed vitae erat lectus.",
          ],
        },
        {
          author: "John Doe",
          image: "https://picsum.photos/500/500?2",
          comments: [],
        },
      ],
    });
  });

  app.use("/", router);
};
