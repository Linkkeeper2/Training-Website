function createSessionData(req) {
    if (!req.session.user) {
        req.session.user = {
            username: "Guest" + Math.floor(Math.random() * 100000),
            signedIn: false
        };

        req.session.save(() => {console.log(`Created session data for ${req.session.user.username}`)});
    }
}

function login(req, username) {
    if (req.session.user) {
        req.session.user = {
            username: username,
            signedIn: true
        };

        req.session.save(() => {console.log(`Sign In: ${username}`)});
    }
}

module.exports = { createSessionData, login };