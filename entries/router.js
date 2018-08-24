const express = require('express');


const {Entry} = require('./models');

const router = express.Router();

router.use(express.json());
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });
router.use(jwtAuth);

// GET request
router.get('/', (req, res) => {
    Entry
    .find({username: req.user.username})
    .then(entries => {
      console.log(req.user)
      res.json({
        entries: entries.map(
          (entry) => entry.serialize())
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'});
    });
  });
  
  // GET by id
  
  router.get('/:id', (req, res) => {
    Entry
      .findById(req.params.id)
      .then(entry => {   
        if (req.user.username === entry.username) {
       res.json(entry.serialize())}
        else {
          res.status(401).json({message: 'Unauthorized user'});
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
  });
  
  
  //POST request
  router.post('/', (req, res) => {
    //ensure all the fields are in req body
    const requiredFields = ['title', 'image', 
    'content'];
    for (let i=0; i<requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing  ${field} field`;
        console.error(message);
        return res.status(400).send(message);
      }
    }
    Entry
      .create({
        username: req.user.username,
        title: req.body.title,
        image: req.body.image,
        content: req.body.content,
      })
      .then(entry => res.status(201).json(entry.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'})
      });
  });
  
  // PUT request
  router.put('/:id', (req, res) => {
    if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      const message = `Request path id (${req.params.id}) and request body id
      (${req.body.id}) must match`;
      console.error(message);
      return res.status(400).json({message: message});
    }
  
    const toUpdate = {};
    const updateableFields = ['title', 'image', 'content',];
    updateableFields.forEach(field => {
      if (field in req.body) {
        console.log(req.body.field)
        toUpdate[field] = req.body[field];
      }
    });
  
    Entry
      .findById(req.params.id)
      .then(function(entry) {
         if (req.user.username === entry.username) {
          Entry
              .findByIdAndUpdate(req.params.id, {$set: toUpdate})
              .then(entry => res.status(204).end());
         }
         else {
           res.status(401).json({message: 'Unauthorized user'})
         }
      })
      
      .catch(err => res.status(500).json({message: 'Internal server error'}))
  
   });
    
  
  // DELETE request
  router.delete('/:id', (req,res) => {
    Entry
      .findById(req.params.id)
      .then(function(entry) {
         if (req.user.username === entry.username) {
      Entry
      .findByIdAndRemove(req.params.id)
      .then(entry => res.status(204).end())
    }
    else {
      res.status(401).json({message: 'Unauthorized user'})
  
    }
    })
    .catch(err => res.status(500).json({message: 'Internal server error'}))
  });
  
  module.exports = {router};
  