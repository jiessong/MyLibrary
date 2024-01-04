const express = require('express');
const router = express.Router();
const Author = require('../models/author');

// All Authors Route
router.get('/', async (req, res) => {
    let searchOptions = {}
    if(req.query.name!=null && req.query.name!=''){ //use query instead of body because using get request
        searchOptions.name = new RegExp(req.query.name, 'i')  //i means case insensitive
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {authors: authors, searchOptions: req.query})
    }catch{
        res.redirect('/')
    }
})

//New Author Route
router.get('/new', (req, res) => {
    res.render('authors/new', {author: new Author()})
})

//Create Author Route
router.post('/', async (req, res) => {  //sync must be used together with await
    const author = new Author({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save()
        res.redirect('authors')
    }catch{
        res.render('authors/new', {
            author: author, 
            errorMessage: 'Error creating new author'
        })
    }
})

module.exports = router 