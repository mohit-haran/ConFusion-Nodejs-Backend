const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get(cors.cors, (req,res,next)=>{
    Promotions.find({})
    .then( promotions =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotions);
    }, (err) => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Promotions.create(req.body)
    .then( promotion => {
        console.log("Promotion created " + promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode = 403;
    res.send('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Promotions.remove({})
    .then( response => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(response);
    }, err => next(err))
    .catch(err => next(err));
});

promoRouter.route('/:promoId')
.get(cors.cors, (req,res,next)=>{
    Promotions.findById(req.params.promoId)
    .then( promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode = 403;
    res.send('POST operation is not supported on /promotions/'+req.params.promoId );
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Promotions.findByIdAndUpdate(req.params.promoId,{
        $set: req.body
    },{
        new: true
    })
    .then( promotion => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Promotions.findByIdAndDelete(req.params.promoId)
    .then( response =>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(response);
    }, (err) => next(err))
    .catch(err => next(err));
});

module.exports = promoRouter;