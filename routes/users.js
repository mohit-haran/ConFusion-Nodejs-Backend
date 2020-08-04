var express = require('express');
var router = express.Router();
var cors = require('./cors');

const bodyParser = require('body-parser');
var User = require('../models/user');

const passport = require('passport');
const authenticate = require('../authenticate');

router.use(bodyParser.json());

/* GET users listing. */


router.get('/', cors.corsWithOptions,  authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  User.find({})
  .then(users=>{
    res.setHeader('Content-Type','application/json');
    res.status(200).send(users);
  },(err) => next(err))
  .catch((err) => next(err));
  
});

router.post('/signup', cors.corsWithOptions,  (req,res,next)=>{
  User.register(new User({username: req.body.username}),req.body.password, (err,user)=>{
    if(err)
    {
      res.statusCode = 500;
      res.setHeader('Content-Type','application/json');
      res.json({err:err});
    }
    else{
      if(req.body.firstname)
      {
        user.firstname = req.body.firstname;
      }
      if(req.body.lastname)
      {
        user.lastname = req.body.lastname;
      }
      user.save((err,user)=>{
        if(err){
          res.setHeader('Content-Type','application/json');
          res.status(500).json({err: err});
          return;
        }
        else{
          res.statusCode = 200;
          res.setHeader('Content-Type','application/json');
          res.json({status:"Registration successful", success: true});
        }
      });
    }
  });
});

router.post('/login',cors.corsWithOptions, passport.authenticate('local'),(req,res,next)=>{

  let token = authenticate.getToken({_id: req.user.id})
  
  res.statusCode = 200;
  res.setHeader('Content-Type','application/json');
  res.json({status:"Login successful", success: true, jwt:token});
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req,res) =>{
  if(req.user){
    var token = authenticate.getToken({_id: req.user.id});

    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({status:"Login successful", success: true, jwt:token});

  }
})

router.get('/logout',(req,res,next)=>{
  if(req.user)
  {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else
  {
    let err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
})

module.exports = router;
