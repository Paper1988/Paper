const express = require("express");
const app = express();
const session = require('express-session');

const path = require("path");
const bodyParser = require('body-parser');

const passport = require('passport');
const { Strategy } = require('passport-discord');
const winston = require('winston');
let port = 8080;

const config = require('../Structures/config.json');
const GuildSettings = require("./Schemas/GuildSettings");

const helmet = require('helmet');
app.use(helmet());

const i18n = require('i18n');
// i18n 設定
i18n.configure({
    locales: ['en', 'zh'], // 添加中文 'zh'
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'zh',
    objectNotation: true,
});

app.use(i18n.init);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
    secret: 'paper-bot-secret',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('locale', 'zh');

passport.use(new Strategy({
    clientID: config.clientId,
    clientSecret: config.clientSecret,
    callbackURL: config.callbackURL,
    scope: ['identify', 'guilds'],
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.get("/", (req, res) => {
    res.render('index');
})

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user }, { title: res.__('Dashboard') });
});

app.post('/dashboard', ensureAuthenticated, (req, res) => {
    const { guildId } = req.body;
    // Save guild settings to MongoDB
    GuildSettings.findOneAndUpdate({ guildId }, { upsert: true }, (err, doc) => {
        if (err) {
            winston.error(err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/dashboard');
    });
});

app.get('/api/guild/:guildId', ensureAuthenticated, (req, res) => {
    const { guildId } = req.params;
    GuildSettings.findOne({ guildId }, (err, settings) => {
        if (err) {
            winston.error(err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!settings) {
            return res.status(404).json({ error: 'Guild settings not found' });
        }
        res.json(settings);
    });
});


app.get('/login', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    });

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get("/tp", (req, res) => {
    res.render("tp");
})

app.use((req, res, next) => {
    res.status(404).render('404'); // 創建一個名為404的ejs模板文件
});

app.use((err, req, res, next) => {
    winston.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`>>> Server is listening on port ${port}`)
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}