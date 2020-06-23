const express = require('express')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport')

const app = express()
const port = 3000

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', ('handlebars'))

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'mySecret', resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use('/', (req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.user = req.user
  next()
})

app.listen(port, () => {
  console.log(`Example app listening on ${port}`)
})

require('./routes')(app, passport)