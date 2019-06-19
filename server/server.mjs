// Modules
import express from 'express'; // The server
import uuid from 'uuid'; // Generation of RFC4122 UUIDs.
import session from 'express-session'; // Session middleware
import createFileStore from 'session-file-store'; // Session file store for Express
import bodyParser from 'body-parser'; // Body parsing middleware.
import passport from 'passport'; // Authentication middleware.
import Strategy from 'passport-local'; // Strategy for Passport
import axios from 'axios'; // Promise based HTTP-client for the browser and node.js
import bcrypt from 'bcrypt'; // Password hashing.

const FileStore = createFileStore(session);
const LocalStrategy = Strategy.Strategy;

// Server
const app = express();
const host = 'localhost';
const port = 3000;

app.listen(port, host, () => {
  console.log(`Listening on ${host}:${port}`);
});

/* 
  Configure Passport to use the local strategy
*/
passport.use(
  // 'email' as alias for username
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    axios
      // Get the user with the provided email
      .get(`http://localhost:5000/users?email=${email}`)
      .then(res => {
        const user = res.data[0];

        // If no user was found
        if (!user) {
          return done(null, false, { message: 'Invalid credentials.\n' });
        }

        // If passwords doesn't match
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: 'Invalid credentials.\n' });
        }
        return done(null, user);
      })
      .catch(error => done(error));
  })
);

// Determine which data of the user should be stored in the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  axios
    .get(`http://localhost:5000/users/${id}`)
    .then(res => done(null, res.data))
    .catch(error => done(error, false));
});

// Add & configure middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    genid: req => {
      return uuid(); // use UUIDs for session IDs
    },
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Create the homepage route at '/'
app.get('/', (req, res) => {
  res.send(`You got home page!\n`);
});

// Create the login get and post routes
app.get('/login', (req, res) => {
  res.send(`You got the login page!\n`);
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (info) {
      return res.send(info.message);
    }
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.login(user, err => {
      if (err) {
        return next(err);
      }
      return res.redirect('/authrequired');
    });
  })(req, res, next);
});

app.get('/authrequired', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('you hit the authentication endpoint\n');
  } else {
    res.redirect('/');
  }
});
