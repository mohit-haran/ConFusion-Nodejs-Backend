const express = require('express');
const Favourites = require('../models/favourite');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const bodyParser = require('body-parser');
const cors = require('./cors');
const e = require('express');
const { response } = require('../app');


const favouriteRouter = express.Router();

favouriteRouter.use(bodyParser.json());

favouriteRouter.route('/')
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favourites.findOne({user:req.user.id})
    .populate('user')
    .populate('dishes')
    .then(favourite => {
        if(favourite != null)
        {
            if(favourite.dishes.length)
            {
                res.type('application/json').status(200).send(favourite);
            }
            else {
                res.type('text/plain').status(404).send("You do not have any favourites");
            }
        }
        else{
            res.type('text/plain').status(404).send("You do not have any favourites");
        }
    })
    
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    let dishes = req.body.map((dish) => dish._id);
    Favourites.findOne({user:req.user.id})
    .then(favourite => {
        if(favourite != null)
        {
            dishes.forEach(dish => {
                if(favourite.dishes.indexOf(dish) === -1)
                favourite.dishes.push(dish);
            });
            favourite.save()
            .then((favourite)=>{
                res.type('application/json').status(200).send(favourite);
            }, err => next(err));
        }
        else {
            Favourites.create({
                user: req.user.id,
                dishes: dishes
            })
            .then( favourite => {
                res.type('application/json').status(200).send(favourite);
            }, err => next(err))
        }
    })
    .catch((err) => next(err));

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.type('text/plain').status(403).send("PUT operation not supported on /favourites/"+req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favourites.deleteOne({user: req.user.id})
    .then( response => {
        res.type('application/json').status(200).send(response);
    })
    .catch(err => next(err));
});

favouriteRouter.route('/:dishId')
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{

    res.type('text/plain').status(403).send("GET operation not supported on /favourites/"+req.params.dishId);
    
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{

    Favourites.findOne({user:req.user.id})
    .then(favourite => {
        if(favourite != null)
        {
            if(favourite.dishes.indexOf(req.params.dishId) == -1)
            {
                favourite.dishes.push(req.params.dishId);
                favourite.save()
                .then((favourite)=>{
                    res.type('application/json').status(200).send(favourite);
                })
            }
            else {
                res.type('application/json').status(200).send(favourite);
            }
        }
        else {
            Favourites.create({
                user: req.user.id,
                dishes: req.params.dishId
            })
            .then( favourite => {
                res.type('application/json').status(200).send(favourite);
            }, err => next(err))
        }
    })
    .catch((err) => next(err));

})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.type('text/plain').status(403).send("GET operation not supported on /favourites/"+req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favourites.findOne({user: req.user.id})
    .then( favourite => {
        if( favourite!= null ) {
            if( favourite.dishes.indexOf(req.params.dishId) != -1){
                favourite.dishes.filter(dish => dish.id !== req.params.dishId);
                favourite.save()
                .then( favourite => {
                    res.type('application/json').status(200).send(favourite);
                },(err) => next(err))
            }
            else{
                res.type('application/json').status(200).send(favourite);
            }
        }
        else{
            var err = new Error('You do not have any favourites');
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err));
});

module.exports = favouriteRouter;