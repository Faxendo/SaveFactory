/**
 * REQUIREMENTS
 */

const Discord = require('discord.js');
const client = new Discord.Client();

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const utils = require('./utils.js');

const params = require('./private/params.json');

let DiscordGuild;
let DiscordSatisfactoryRole;

/**
 * CONSTANTS
 */

const port = process.env.PORT || 54321;

/**
 * IO CONFIGURATION
 */

io.on('connection', () => {

});

/**
 * EXPRESS CONFIGURATION
 */

// CONFIGURATION
app.use(bodyParser.json());
app.use(session({
    secret: params.SessionSecret
}));
app.use(express.static('static'));

// LOGIN

app.get('/login', (req, res) => {
    res.redirect(params.DiscordAuthUrl);
});

app.get('/loginReturn', (req, res) => {
    utils.getDiscordInfos(req.query.code).then(user => {
        let foundUser = DiscordGuild.members.find(m => m.id == user.id);
        if (foundUser){
            let foundRole = foundUser.roles.find(r => r == DiscordSatisfactoryRole);
            if (foundRole){
                req.session.authenticated = true;
                req.session.client = user;
                res.redirect('/');
            } else {
                res.redirect('/forbidden');
            }
        } else {
            res.redirect('/forbidden');
        }
    });
});

// HTML PAGES

app.get('/', (req, res) => {
    if (req.session.authenticated == undefined || req.session.authenticated != true){
        return res.redirect('/login');
    }
    console.log(req.session);
    return res.sendFile(__dirname + '/static/home.html');
});

app.get('/forbidden', (req, res) => {
    return res.sendFile(__dirname + '/static/forbidden.html');
});

// SAVE MANAGEMENT

app.get('/session', (req, res) => {
    let response = {};
    utils.listFile().then(files => {
        response.files = files;
        utils.findLastGameSession().then(session => {
            response.session = session;
            res.send(response);
        });
    });
});

app.post('/startSession', (req, res) => {
    utils.startGameSession(req.session.client).then(() => {
        res.send({ok: true});
    });
});

app.post('/endSession', (req, res) => {
    utils.endGameSession().then(() => {
        res.send({ok: true});
    });
});

/**
 * DISCORD CLIENT
 */

client.on('ready', () => {
    console.log(`Discord Bot online : say hello to '${client.user.tag}' !`);
    DiscordGuild = client.guilds.get(params.DiscordGuildId);
    DiscordSatisfactoryRole = DiscordGuild.roles.get(params.DiscordSatisfactoryRoleId);
});

/**
 * INITIALIZATION
 */

server.listen(port, () => {
    console.log(`Express & Socket.io listening on ${port}`);
    client.login(params.DiscordBotToken);
});