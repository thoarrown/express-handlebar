// // simple express server
// var express = require("express");
// var fs = require("fs");
// var exphbs = require("express-handlebars");
// var bodyParser = require("body-parser");
// var app = express();
// var config = require("./config/config.js");
// const fetch = require("isomorphic-unfetch");
// var path = require("path");

// app.use(async function (req, res, next) {
//   const host = req.headers.host;
//   let isDomain = false;
//   if (host) {
//     let domain = host || null;
//     if (domain && domain.includes("localhost"))
//       domain = process.env.DOMAIN || "thoarrow";
//     let result = await fetch(`${config.endpoint}/custom-domain/check`, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ domain }),
//     })
//       .then((res) => res.json())
//       .then((val) => {
//         return val;
//       });
//     if (result && result.status === 200) {
//       isDomain = result.data;
//     }
//   }
//   if (isDomain && isDomain.id) req.isDomain = isDomain;
//   next();
// });

// // app.engine(
// //   "handlebars",
// //   exphbs({
// //     defaultLayout: "layout",
// //     layoutsDir: "views/layouts/",
// //     partialsDir: "views/partials/",
// //   })
// // );

// // app.set("view engine", "handlebars");

// app.use(function (req, res, next) {
//   // cache original render
//   var _render = res.render;

//   res.render = function (view, options, done) {
//     // custom logic to determine which theme to render
//     var theme = getThemeFromRequest(req);
//     // ends up rendering /themes/theme1/index.hbs
//     _render.call(this, "themes/" + theme + "/layouts/" + view, options, done);
//   };
//   next();
// });
// var hbs = exphbs.create({
//   defaultLayout: "layout",
//   extname: ".hbs",
//   partialsDir: ["views/partials/", "views/themes/zeus/partials/"],
// });

// app.engine("hbs", hbs.engine);
// app.set("view engine", "hbs");
// app.set("views", __dirname + "/views");
// // app.use(
// //   bodyParser.urlencoded({
// //     extended: true,
// //   })
// // );
// // app.use(bodyParser.json());
// // app.set("host", config.host);

// require("./routes/routes.js")(express, app, fs);

// app.use(express.static(path.join(__dirname, "public")));

// // var server = require("http").createServer(app);

// app.listen(process.env.PORT || 5000, function () {
//   if (process.env.PORT !== undefined) {
//     console.log("Server is running at port " + process.env.PORT);
//   } else {
//     console.log("Server is running at port 5000");
//   }
// });

// function getThemeFromRequest(req) {
//   // in your case you probably would get this from req.hostname or something
//   // but this example will render the file from theme2 if you add ?theme=2 to the url
//   if (req.query && req.query.theme) {
//     return req.query.theme;
//   }
//   // default to theme1
//   return "zeus";
// }
// ============
const express = require("express");
const exphbs = require("express-handlebars");
const fetch = require("isomorphic-unfetch");
const endpoint =
  process.env.NODE_ENV === "production"
    ? `http://localhost:8888/api`
    : `http://localhost:8888/api`;

const app = express();

app.use(async function (req, res, next) {
  const host = req.headers.host;
  let isDomain = false;
  if (host) {
    let domain = host || null;
    if (domain && domain.includes("localhost"))
      domain = process.env.DOMAIN || "thangtkt";
    let result = await fetch(`${endpoint}/custom-domain/check`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ domain }),
    })
      .then((res) => res.json())
      .then((val) => {
        return val;
      });
    if (result && result.status === 200) {
      isDomain = result.data;
    }
  }
  if (isDomain && isDomain.id) req.isDomain = isDomain;
  next();
});
// app.engine(
// 	"hbs",
// 	exphbs({
// 		defaultLayout: "main",
// 		extname: ".hbs",
// 		partialsDir: ["views/partials/", "views/themes/theme1/partials/"],
// 	})
// );
// Create `ExpressHandlebars` instance with a default layout.
var hbs = exphbs.create({
  defaultLayout: "main",
  extname: ".hbs",
  partialsDir: ["views/partials/", "views/themes/theme1/partials/"],
  // layoutsDir: "views/themes/theme1/layouts/",
});

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine("hbs", hbs.engine);
// app.set("view engine", "handlebars");

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");

app.use(function (req, res, next) {
  // cache original render
  var _render = res.render;

  res.render = function (view, options, done) {
    // custom logic to determine which theme to render
    var theme = getThemeFromRequest(req);
    // ends up rendering /themes/theme1/index.hbs
    _render.call(this, "themes/" + theme + "/layouts/" + view, options, done);
  };
  next();
});

// Middleware to expose the app's shared templates to the client-side of the app
// for pages which need them.
function exposeTemplates(req, res, next) {
  // Uses the `ExpressHandlebars` instance to get the get the **precompiled**
  // templates which will be shared with the client-side of the app.
  hbs
    .getTemplates("shared/templates/", {
      cache: app.enabled("view cache"),
      precompiled: true,
    })
    .then(function (templates) {
      // RegExp to remove the ".handlebars" extension from the template names.
      var extRegex = new RegExp(hbs.extname + "$");

      // Creates an array of templates which are exposed via
      // `res.locals.templates`.
      templates = Object.keys(templates).map(function (name) {
        return {
          name: name.replace(extRegex, ""),
          template: templates[name],
        };
      });

      // Exposes the templates during view rendering.
      if (templates.length) {
        res.locals.templates = templates;
      }

      setImmediate(next);
    })
    .catch(next);
}

require("./routes/routes.js")(express, app, "fs");

// app.get("/", (req, res, next) => {
// 	// let theme = getThemeFromRequest(req);
// 	// console.log(theme);
// 	res.render("home", {
// 		// layout: "zeus",
// 		posts: [
// 			{
// 				author: "Janith Kasun",
// 				image: "https://picsum.photos/500/500",
// 				comments: [
// 					"This is the first comment",
// 					"This is the second comment",
// 					"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum nec fermentum ligula. Sed vitae erat lectus.",
// 				],
// 			},
// 			{
// 				author: "John Doe",
// 				image: "https://picsum.photos/500/500?2",
// 				comments: [],
// 			},
// 		],
// 	});
// });
function getThemeFromRequest(req) {
  // in your case you probably would get this from req.hostname or something
  // but this example will render the file from theme2 if you add ?theme=2 to the url
  if (req.query && req.query.theme) {
    return req.query.theme;
  }
  // default to theme1
  return "zeus";
}
app.listen(5000, () => {
  console.log("The web server has started on port 5000");
});
