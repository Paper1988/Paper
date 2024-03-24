const express = require('express')
const app = express()
const session = require('express-session')
const MongoStore = require('connect-mongo')

const path = require('path')
const bodyParser = require('body-parser')

const passport = require('passport')
const { Strategy } = require('passport-discord')
const winston = require('winston')
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
})
// port 設定
let port = 8080

const GuildSettings = require('./Schemas/GuildSettings')
const client = require('../index.js')

const helmet = require('helmet')
app.use(helmet())

const i18n = require('i18n')
// i18n 設定
i18n.configure({
    locales: ['en', 'zh'], // 添加中文 'zh'
    directory: path.join(__dirname, 'locales'),
    defaultLocale: 'zh',
    objectNotation: true
})

app.use(i18n.init)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(
    session({
        secret: 'paper-bot-secret',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl:
                'mongodb+srv://Paper:13345627@dclvl.62oke.mongodb.net/?retryWrites=true&w=majority&appName=DClvl',
            autoRemove: 'interval',
            autoRemoveInterval: 7 * 24 * 60, // In minutes.
            touchAfter: 24 * 3600, // time period in seconds
            crypto: {
                secret: 'papere-otb-seceur-code'
            }
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        }
    })
)

app.use(passport.initialize())
app.use(passport.session())

app.set('locale', 'zh')

passport.use(
    new Strategy(
        {
            clientID: client.config.clientId,
            clientSecret: client.config.clientSecret,
            callbackURL: client.config.callbackURL,
            scope: ['identify', 'guilds']
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile)
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((obj, done) => {
    done(null, obj)
})

app.get('/', (req, res) => {
    res.render('index', { client, user: req.user })
})

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user })
})

app.post('/dashboard', ensureAuthenticated, (req, res) => {
    const { guildId } = req.body
    // Save guild settings to MongoDB
    GuildSettings.findOneAndUpdate({ guildId }, { upsert: true })
        .exec()
        .then((err, doc) => {
            if (err) {
                logger.error(err)
                return res.status(500).send('Internal Server Error')
            }
            res.redirect('/dashboard')
        })
})

app.get('/api/guild/:guildId', ensureAuthenticated, (req, res) => {
    const { guildId } = req.params
    GuildSettings.findOne({ guildId })
        .exec()
        .then((err, settings) => {
            if (err) {
                logger.error(err)
                return res.status(500).json({ error: res.__('Internal Server Error') })
            }
            if (!settings) {
                return res.status(404).json({ error: res.__('Guild settings not found') })
            }
            res.json(settings)
        })
})

app.get('/login', passport.authenticate('discord'))

app.get(
    '/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard')
    }
)

app.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err)
        res.redirect('/')
    })
})

app.get('/terms', (req, res) => {
    res.render('terms')
})

app.use((req, res, next) => {
    res.status(404).render('404') // 創建一個名為404的ejs模板文件
})

app.use((err, req, res, next) => {
    logger.error(err.stack)
    res.status(500).send('Something went wrong!')
})

app.listen(port, () => {
    console.log(`>>> Server is listening on port ${port}`)
})

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/')
}
