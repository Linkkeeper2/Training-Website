const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

const http = require("http");
const server = http.createServer(app);

const uriString = "mongodb+srv://Linkkeeper2:admin@cluster0.hae2g3k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

MongoClient.connect(uriString, { autoSelectFamily: false })
    .then(client => {
        const db = client.db('Test');

        const questionsCollection = db.collection("Questions");

        app.set('view engine', 'ejs');
        app.set('trust proxy', 1);
        app.use(expressLayouts);
        app.set('layout', './layouts/page');
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(express.static('public'));

        app.get("/", (req, res) => {
            res.render("pages/home.ejs");
        });

        app.use((req, res, next) => {
            res.status(404).render("server/404.ejs");
        });

        const port = 3000;

        server.listen(port, function() {
            console.log(`Server listening on http://localhost:${port}`);
        });
    })
    .catch(error => console.error(error));