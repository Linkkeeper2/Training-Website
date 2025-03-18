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
        const testsCollection = db.collection("Tests");

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

            res.render("pages/home.ejs", { account: req.session.user });
        });

        app.get("/tests", (req, res) => {
            createSessionData(req);

            testsCollection.find().toArray()
            .then(tests => {
                res.render("pages/tests/index.ejs", { account: req.session.user, tests: tests });
            })
            .catch(error => console.error(error));
        });

        app.get("/tests/new", (req, res) => {
            createSessionData(req);

            res.render("pages/tests/create.ejs", { account: req.session.user });
        });

        app.get("/tests/:name", (req, res) => {
            createSessionData(req);

            questionsCollection.find({ testName: req.params.name }).toArray()
            .then(questions => {
                res.render("pages/tests/view.ejs", { account: req.session.user, questions: questions });
            })
            .catch(error => console.error(error));
        });

        app.post("/tests/create", (req, res) => {
            testsCollection.insertOne({
                name: req.body.name,
                author: req.session.user.username
            })
            .then(() => {
                for (let i = 1; i <= 10; i++) {
                    let options = [];

                    for (let k = 1; k <= 4; k++)
                        options.push(req.body[`questionName${i}_option_${k}`]);

                    questionsCollection.insertOne({
                        testName: req.body.name,
                        name: req.body[`questionName${i}`],
                        answer: parseInt(req.body[`correctAnswer_${i}`]),
                        options: options
                    })
                    .then()
                    .catch(error => confirm.error(error));
                }

                res.redirect("/tests");
            })
            .catch(error => console.error(error));
        });

        app.get("/account", (req, res) => {
            createSessionData(req);

            res.render("pages/accounts/account.ejs", { account: req.session.user });
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