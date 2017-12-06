const express = require('express');
const Post = require('../models/post');
const Board = require('../models/board');

const router = express.Router();
const PER_PAGE = 10;

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
router.get('/:boardId/:page/:sortType', (req, res) => {
  const skipSize = (req.params.page - 1) * PER_PAGE;
  let pageNum = 1;
  const sortObject = {};
  const stype = req.params.sortType;
  sortObject[stype] = -1;

  Board.findOne({ boardId: req.params.boardId }, (errBoard, resultBoard) => {
    if (resultBoard) {
      console.log(resultBoard);
      Post.count({ deleted: false, boardId: req.params.boardId }, (err, totalCount) => {
        if (err) throw err;

        pageNum = Math.ceil(totalCount / PER_PAGE);
        Post
          .find({ deleted: false, boardId: req.params.boardId })
          .sort(sortObject)
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
    } else {
      return res.status(400).json({
        message: `There is no board ${req.params.boardId}`
      });
    }
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
    rawContent.comments.unshift({ name: 'gook', id: 'gook', memo: comment });
    rawContent.commentsCount += 1;
    rawContent.save((error, replyResult) => {
      if (error) throw error;
      res.json(replyResult);
    });
  });
});

/* SUBMIT POST */
router.post('/:boardId', (req, res) => {
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

  req.body.authorName = 'gook';
  req.body.authorId = 'gook';
  req.body.boardId = req.params.boardId;

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

//
// /*
//     TOGGLES STAR OF POST: POST /api/post/star/:id
//     ERROR CODES
//         1: INVALID ID
//         2: NOT LOGGED IN
//         3: NO RESOURCE
// */
// router.post('/star/:id', (req, res) => {
//   // CHECK POST ID VALIDITY
//   if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//     return res.status(400).json({
//       error: 'INVALID ID',
//       code: 1
//     });
//   }
//
//   // CHECK LOGIN STATUS
//   if (typeof req.session.loginInfo === 'undefined') {
//     return res.status(403).json({
//       error: 'NOT LOGGED IN',
//       code: 2
//     });
//   }
//
//   // FIND POST
//   Post.findById(req.params.id, (err, post) => {
//     if (err) throw err;
//
//     // POST DOES NOT EXIST
//     if (!post) {
//       return res.status(404).json({
//         error: 'NO RESOURCE',
//         code: 3
//       });
//     }
//
//     // GET INDEX OF USERNAME IN THE ARRAY
//     const index = post.starred.indexOf(req.session.loginInfo.username);
//
//     // CHECK WHETHER THE USER ALREADY HAS GIVEN A STAR
//     const hasStarred = (index !== -1);
//
//     if (!hasStarred) {
//       // IF IT DOES NOT EXIST
//       post.starred.push(req.session.loginInfo.username);
//     } else {
//       // ALREADY starred
//       post.starred.splice(index, 1);
//     }
//
//     // SAVE THE POST
//     post.save((error, result) => {
//       if (error) throw error;
//       res.json({
//         success: true,
//         has_starred: !hasStarred,
//         result,
//       });
//     });
//   });
// });


module.exports = router;
