const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const passport = require('passport');
const path = require('path');
const public = path.join(__dirname, 'public');
const photos = path.join(__dirname, 'photos');;


const {PORT, DATABASE_URL} = require('./config');


const app = express();
const faker = require('faker');



app.use(express.static('public'));
app.use(morgan('common'));
app.use('/', express.static(public));
app.use('/', express.static(photos));


const { router: entriesRouter } = require('./entries');
const { router: usersRouter } = require('./users');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');


// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/entries', entriesRouter);

app.get('/', function(req, res) {
    res.sendFile(path.join(public, 'home.html'));
})

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});







// RUN / CLOSE SERVER

let server;


function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if(err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  }); 
}


function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });  
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};



module.exports = {app, runServer, closeServer};