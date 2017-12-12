/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const Post = require('../db/models/post');
const comment = require('./comment');
const isAuthenticated = require('../middlewares/isAuthenticated');

const router = express.Router();
const PER_PAGE = 10;

// sub routes for comments
router.use('/comment', comment);

/* POST DETAIL */
router.get('/detail/:id', (req, res) => {
  Post.findById({
    _id: req.params.id
  }, (err, post) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Could not retrieve post w/ that id'
      });
    }
    if (!post) {
      return res.status(404).json({
        message: 'Post not found'
      });
    }

    post.count += 1;
    post.save((errCount) => { // view count
      if (errCount) throw errCount;
    });
    res.json(post);
  });
});

/* GET POST LIST */
router.get('/board', (req, res) => {
  Post.distinct('boardId')
    .exec((err, boards) => {
      if (err) throw err;
      res.json(boards);
    });
});

/* GET POST LIST */
router.get('/:boardId/:page', (req, res) => {
  const skipSize = (req.params.page - 1) * PER_PAGE;
  let pageNum = 1;

  Post.count({ deleted: false, boardId: req.params.boardId }, (err, totalCount) => {
    if (err) throw err;

    pageNum = Math.ceil(totalCount / PER_PAGE);
    Post
      .find({ deleted: false, boardId: req.params.boardId })
      .sort({
        postNum: -1
      })
      .skip(skipSize)
      .limit(PER_PAGE)
      .exec((error, posts) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: 'Could not retrieve posts'
          });
        }

        const meta = {
          limit: PER_PAGE,
          pagination: pageNum
        };

        const json = {
          meta,
          posts
        };
        res.json(json);
      });
  });
});

/* GET SEARCH POSTS */
router.get('/search/:searchWord/:boardId/:page', (req, res) => {
  const skipSize = (req.params.page - 1) * PER_PAGE;
  let pageNum = 1;
  const { searchWord } = req.params;
  const searchCondition = { $regex: searchWord };
  Post.count({
    deleted: false,
    boardId: req.params.boardId,
    $or: [
      { title: searchCondition },
      { contents: searchCondition },
      { writer: searchCondition }
    ]
  }, (err, totalCount) => {
    if (err) throw err;
    pageNum = Math.ceil(totalCount / PER_PAGE);
    Post
      .find({
        deleted: false,
        boardId: req.params.boardId,
        $or: [
          { title: searchCondition },
          { contents: searchCondition },
          { writer: searchCondition }]
      })
      .sort({
        postNum: -1
      })
      .skip(skipSize)
      .limit(PER_PAGE)
      .exec((error, posts) => {
        if (error) {
          console.log(error);
          return res.status(500).json({
            message: 'Could not retrieve posts'
          });
        }
        const meta = {
          limit: PER_PAGE,
          pagination: pageNum
        };

        const json = {
          meta,
          posts
        };
        res.json(json);
      });
  });
});
// GIVING LIKES FOR POSTS
// @Params:
//  postId: 좋아요 눌러질 포스트의 아이디
router.post('/likes/:postId', isAuthenticated, (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
    return res.status(400).json({
      message: 'INVALID POST ID'
    });
  }
  Post.findById(req.params.postId, (err, post) => {
    if (err) throw err;
    if (!post) return res.status(404).json({ message: 'NO SUCH POST' });
    const index = post.likes.indexOf(req.user.username);
    const didLike = (index !== -1);
    if (!didLike) {
      post.likes.push(req.user.username);
    } else {
      post.likes.splice(index, 1);
    }
    post.save((error, result) => {
      if (error) throw error;
      return res.json(result);
    });
  });
});

// GIVING DISLIKES FOR POSTS
// @Params:
//  postId: 싫어요 눌러질 포스트의 아이디
router.post('/disLikes/:postId', isAuthenticated, (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.postId)) {
    return res.status(400).json({
      message: 'INVALID POST ID'
    });
  }

  Post.findById(req.params.postId, (err, post) => {
    if (err) throw err;
    if (!post) return res.status(404).json({ message: 'NO SUCH POST' });

    const index = post.disLikes.indexOf(req.user.username); // 테스팅 목적
    const didDislike = (index !== -1);
    if (!didDislike) {
      post.disLikes.push(req.user.username);
    } else {
      post.disLikes.splice(index, 1);
    }
    post.save((error, result) => {
      if (error) throw error;
      return res.json(result);
    });
  });
});
/* CREATE REPLY */
router.post('/reply', (req, res) => {
  const { body } = req;
  const { comment } = body;
  // simulate error if title, categories and content are all "test"
  // This is demo field-validation error upon submission.
  if (comment === 'test') {
    return res.status(403).json({
      message: {
        // categories: 'Categories Error',
        content: 'Content Error'
      }
    });
  }

  if (!comment) {
    return res.status(400).json({
      message: 'Error: content is required!'
    });
  }

  Post.findOne({ _id: req.body.postId }, (err, rawContent) => {
    if (err) throw err;
    rawContent.comments.push({ name: req.user.username, id: req.user._id, memo: comment, avatar: req.user.avatar });
    rawContent.save((error, replyResult) => {
      if (error) throw error;
      res.json(replyResult);
    });
  });
});

/* SUBMIT POST */
router.post('/:boardId', isAuthenticated, (req, res) => {
  const { body } = req;
  const { title } = body;
  const { contents } = body;

  // simulate error if title, categories and content are all "test"
  // This is demo field-validation error upon submission.
  if (title === 'test' && contents === 'test') {
    return res.status(403).json({
      message: 'Title Error - Cant use "test" in all fields!'
    });
  }

  if (!title || !contents) {
    return res.status(400).json({
      message: 'Error title and content are all required!'
    });
  }
  req.body.authorName = req.user.username;
  req.body.authorId = req.user._id;
  req.body.boardId = req.params.boardId;
  req.body.avatar = req.user.avatar;
  Post.create(req.body, (err, postResult) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Could not save post'
      });
    }
    res.json(postResult);
  });
});

/* POST DELETE */
router.delete('/:id', (req, res) => {
  Post.findOneAndUpdate({ _id: req.params.id },
    { deleted: true }, { runValidators: true, new: true }, (err, result) => {
      if (err) {
        throw err;
      }
      if (!result) {
        return res.status(404).json({
          message: 'Could not delete post'
        });
      }
      res.json({
        result: 'Post was deleted'
      });
    });
});

/* EDIT POST */
router.put('/:id', (req, res) => {
  const { body } = req;
  const { title } = body;
  const { contents } = body;
  // simulate error if title, categories and content are all "test"
  // This is demo field-validation error upon submission.
  if (title === 'test' && contents === 'test') {
    return res.status(403).json({
      message: 'Title Error - Cant use "test" in all fields!'
    });
  }

  // CHECK CONTENTS VALID
  if (typeof req.body.contents !== 'string') {
    return res.status(400).json({
      message: 'INVALID CONTENTS'
    });
  }

  Post.findOne({ _id: req.params.id }, (err, originContent) => {
    if (err) throw err;
    originContent.updated.push({ title: originContent.title, contents: originContent.contents });
    originContent.save((errOrigin) => {
      if (errOrigin) throw errOrigin;
    });
  });

  Post.findOneAndUpdate({ _id: req.params.id },
    req.body, { runValidators: true, new: true }, (err, result) => {
      if (err) {
        throw err;
      }
      res.json(result);
    });
});


module.exports = router;
