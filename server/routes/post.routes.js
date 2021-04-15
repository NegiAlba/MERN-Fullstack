const Post = require('../models/post.model');
const User = require('../models/user.model');
const router = require('express').Router();
const multer = require("multer");
const upload = multer();
const ObjectID = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

//? Route pour tous les posts
router.get('/', (req, res) => {
    Post.find((err, docs) => {
      if (!err) res.send(docs);
      else console.log("Error to get data : " + err);
    }).sort({ createdAt: -1 });
});

//? Route pour tous les posts d'un user précis
router.get('/user/:username', async (req,res)=>{
    try {
        const author = await User.findOne({username:req.params.username}).select('_id');

        await Post.find({authorId : author._id}, (error, data, next) => {
            if (error) {
            return next(error)
            } else {
            res.json(data)
            }
        })
    } catch (error) {
        res.status(500).json(error);
    }
})

//? Route pour un seul post
router.get('/:id', (req,res)=>{
    Post.findById(req.params.id, (error, data) => {
        if (error) {
          return next(error)
        } else {
          res.json(data)
        }
    })
})

//? Route pour l'upload d'un user
router.post('/', upload.single("file"), async (req, res) => {
    let fileName = "random-jpg";
  
    // if (req.file !== null) {
    //   try {
    //     if (
    //       req.file.detectedMimeType != "image/jpg" &&
    //       req.file.detectedMimeType != "image/png" &&
    //       req.file.detectedMimeType != "image/jpeg"
    //     )
    //       throw Error("invalid file");
  
    //     if (req.file.size > 5000000) throw Error("max size");
    //   } catch (err) {
    //     return res.status(201).json(err);
    //   }
    //   fileName = req.body.authorId + Date.now() + ".jpg";
  
    //   await pipeline(
    //     req.file.stream,
    //     fs.createWriteStream(
    //       `${__dirname}/../../client/public/uploads/posts/${fileName}`
    //     )
    //   );
    // }
  
    const newPost = new Post({
      authorId: req.body.authorId,
      message: req.body.message,
      picture: req.file !== null ? "./uploads/posts/" + fileName : "",
      video: req.body.video,
      likers: [],
      comments: [],
    });
  
    try {
      const post = await newPost.save();
      return res.status(201).json(post);
    } catch (err) {
      return res.status(400).send(err);
    }
});


router.put('/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    const updatedRecord = {
      message: req.body,
    };
  
    Post.findByIdAndUpdate(
      req.params.id,
      { $set: updatedRecord },
      { new: true },
      (err, docs) => {
        if (!err) res.send(docs);
        else console.log("Update error : " + err);
      }
    );
});

router.delete('/:id', (req,res,next)=>{

    if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

    Post.findByIdAndRemove(req.params.id, (error, data) => {
        if (error) {
          return next(error);
        } else {
          res.status(200).json({
            msg: data
          })
        }
      })
});

router.patch('/like-post/:id', async (req,res)=>{
    if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await Post.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true },
      (err, docs) => {
        if (err) return res.status(400).send(err);
      }
    );
    await User.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id },
      },
      { new: true },
      (err, docs) => {
        if (!err) res.send(docs);
        else return res.status(400).send(err);
      }
    );
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.patch('/unlike-post/:id', async (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      await Post.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.id },
        },
        { new: true },
        (err, docs) => {
          if (err) return res.status(400).send(err);
        }
      );
      await User.findByIdAndUpdate(
        req.body.id,
        {
          $pull: { likes: req.params.id },
        },
        { new: true },
        (err, docs) => {
          if (!err) res.send(docs);
          else return res.status(400).send(err);
        }
      );
    } catch (err) {
      return res.status(400).send(err);
    }
});

router.patch('/comment-post/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      return Post.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              commenterId: req.body.commenterId,
              commenterPseudo: req.body.commenterPseudo,
              text: req.body.text,
              timestamp: new Date().getTime(),
            },
          },
        },
        { new: true },
        (err, docs) => {
          if (!err) return res.send(docs);
          else return res.status(400).send(err);
        }
      );
    } catch (err) {
      return res.status(400).send(err);
    }
});

router.patch('/edit-comment-post/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      return Post.findById(req.params.id, (err, docs) => {
        const theComment = docs.comments.find((comment) =>
          comment._id.equals(req.body.commentId)
        );
  
        if (!theComment) return res.status(404).send("Comment not found");
        theComment.text = req.body.text;
  
        return docs.save((err) => {
          if (!err) return res.status(200).send(docs);
          return res.status(500).send(err);
        });
      });
    } catch (err) {
      return res.status(400).send(err);
    }
});

router.patch('/delete-comment-post/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);
  
    try {
      return Post.findByIdAndUpdate(
        req.params.id,
        {
          $pull: {
            comments: {
              _id: req.body.commentId,
            },
          },
        },
        { new: true },
        (err, docs) => {
          if (!err) return res.send(docs);
          else return res.status(400).send(err);
        }
      );
    } catch (err) {
      return res.status(400).send(err);
    }
});

module.exports = router;