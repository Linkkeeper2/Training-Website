const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();

const http = require("http");
const server = http.createServer(app);

const uriString = "mongodb+srv://Linkkeeper2:admin@cluster0.hae2g3k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const { createSessionData, login } = require("./server/util/util");

MongoClient.connect(uriString, { autoSelectFamily: false })
    .then(client => {
        const db = client.db('Test');

        const accountsCollection = db.collection("Accounts");

        const questionsCollection = db.collection("Questions");

        app.set('view engine', 'ejs');
        app.set('trust proxy', 1);

        app.use(session({ secret: "account", cookie: { secure: false }, resave: false, saveUninitialized: true }));

        app.use(expressLayouts);
        app.set('layout', './layouts/page');

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.use(express.static('public'));

        app.get("/", (req, res) => {
            createSessionData(req);

            res.render("pages/home.ejs");
        });

        app.get("/account", (req, res) => {
            createSessionData(req);

            res.render("pages/accounts/account.ejs");
        });

        app.post("/account", (req, res) => {
            accountsCollection.findOneAndUpdate({ username: req.body.username }, 
                {
                    $set: {
                        username: req.body.username
                    }
                },
                {
                    upsert: true
                }
            )
            .then(user => {
                login(req, req.body.username);

                res.redirect("/");
            })
            .catch(error => console.error(error));
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