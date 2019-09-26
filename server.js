// Dependencies
const express = require("express");
const exphbs = require("express-handlebars");
const mongojs = require("mongojs");
const axios = require("axios");
const cheerio = require("cheerio");
const PORT = process.env.PORT || 8080;

const app = express();

// Database configuration
const databaseUrl = "scraper";
const collections = ["scrapedNews"];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Hook mongojs configuration to the db constiable
const db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});



app.get("/", function(req, res) {
    res.render("index");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  db.scrapedData.find({}, function(error, found) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(found);
    }
  });
});

// Scrape info from news site
app.get("/scrape", function(req, res) {
  axios.get("https://www.fox10phoenix.com/tag/crime-publicsafety").then(function(response) {
    const $ = cheerio.load(response.data);
    $("h3.title").each(function(i, element) {
      const title = $(element).children("a").text();
      const link = $(element).children("a").attr("href");

      if (title && link) {
        db.scrapedData.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            console.log(err);
          }
          else {
            console.log(inserted);
          }
        });
      }
    });
  });

  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});