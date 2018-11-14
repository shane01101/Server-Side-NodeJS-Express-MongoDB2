const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites == null) {
            Favorites.create({user: req.user._id})
            .then((fav) => {
                for(let i = 0; i < req.body.length; i++) {
                    if(fav.dishes.indexOf(req.body[i]._id) === -1)
                        fav.dishes.push(req.body[i]._id);
                }
                fav.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            for(let i = 0; i < req.body.length; i++) {
                if(favorites.dishes.indexOf(req.body[i]._id) === -1)
                    favorites.dishes.push(req.body[i]._id);
            }
            favorites.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: req.user._id})
    .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites == null) {
            Favorites.create({user: req.user._id})
            .then((fav) => {
                fav.dishes.push(req.params.dishId);
                fav.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            }, (err) => next(err))
            .catch((err) => next(err));
        }
        else {
            if(favorites.dishes.indexOf(req.params.dishId) === -1) {
                favorites.dishes.push(req.params.dishId);
                favorites.save();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            } else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end("DishId Already Exists in user's favorites");
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(favorites != null) {
            for(let i = 0; i < favorites.dishes.length; i++) 
                if(favorites.dishes[i]._id.equals(req.params.dishId)) 
                    favorites.dishes.remove(req.params.dishId);
                
            favorites.save();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        }
        else {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json');
            res.end("User does not have any favorites");
        }
        
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;