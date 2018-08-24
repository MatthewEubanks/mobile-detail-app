const express = require('express');


const {Entry} = require('./models');

const router = express.Router();

router.use(express.json());
const passport = require('passport');

const jwtAuth = passport.authenticate('jwt', { session: false });
router.use(jwtAuth);

router.get('/', jwtAuth,  (req, res) => {
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
      res.status(500).json({message: 'Internal server error'})
    });
  });
//NEW ROUTE
router.post('/posts', jwtAuth, function (req, res) {
    const requiredFields = ['title', 'content','picture', 'userName'];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    });

    Author
        .findById(req.body.userName)
        .then(author => {
            if (author) {
                BlogPost
                    .create({
                        title: req.body.title,
                        content: req.body.content,
                        author: req.body.id
                    })
                    .then(blogPost => res.status(201).json({
                        id: blogPost.id,
                        author: `${author.firstName} ${author.lastName}`,
                        content: blogPost.content,
                        title: blogPost.title,
                        comments: blogPost.comments
                    }))
                    .catch(err => {
                        console.error(err);
                        res.status(500).json({
                            error: 'Something went wrong'
                        });
                    });
            } else {
                const message = `Author not found`;
                console.error(message);
                return res.status(400).send(message);
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: 'something went horrible awry'
            });
        });
});
// //EDIT ROUTE
// router.put('/posts/:id', function (req, res) {
//     if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//         res.status(400).json({
//             error: 'Request path id and request body id values must match'
//         });
//     }
//     const updated = {};
//     const updateableFields = ['title', 'content'];
//     updateableFields.forEach(field => {
//         if (field in req.body) {
//             updated[field] = req.body[field];
//         }
//     });
//     BlogPost
//         .findByIdAndUpdate(req.params.id, {
//             $set: updated
//         }, {
//             new: true
//         })
//         .then(updatedPost => res.status(200).json({
//             id: updatedPost.id,
//             title: updatedPost.title,
//             content: updatedPost.content
//         }))
//         .catch(err => res.status(500).json({
//             message: err
//         }));
// });

// //DELETE ROUTE
// router.delete('/posts/:id', function (req, res) {
//     BlogPost
//         .findByIdAndRemove(req.params.id)
//         .then(() => {
//             console.log(`Deleted blog post with id \`${req.params.id}\``);
//             res.status(204).end();
//         });
// });

  module.exports = {router};