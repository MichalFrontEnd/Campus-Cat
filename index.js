const express = require("express");
const app = express();

app.use(express.static("./public"));
//app.use(express.static("./"));

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const db = require("./db");

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});

app.listen(8080, () => console.log("petition server is listening..."));
