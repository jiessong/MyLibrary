const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book')

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
//should be above the author/:id route, otherwise, new will be treated as id
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
        // res.redirect('authors')
        res.redirect(`/authors/${newAuthor.id}`)
    }catch{
        res.render('authors/new', {
            author: author, 
            errorMessage: 'Error creating new author'
        })
    }
})

router.get('/:id', async (req, res) =>{
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        res.render('authors/show', {author: author, booksByAuthor: books})
    }catch(err){
        console.log(err)
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) =>{
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', {author: author})
    }catch{
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) =>{
    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    }catch{
        if(author == null){
            res.redirect('/')
        }else{
            res.render('authors/edit', {
                author: author, 
                errorMessage: 'Error updating the author'
            })
        }
    }
})

router.delete('/:id', async (req, res) =>{
    let deletedAuthor
    try{
        deletedAuthor = await Author.findOneAndDelete({"_id":req.params.id})
        console.log('deletedAuthor:',deletedAuthor)
        res.redirect('/authors')
    }catch(error){
        if(deletedAuthor == null){
            console.log('deletedAuthor is null')
            res.redirect('/')
        }else{
            console.log('deletedAuthor is not null ',error)
            res.redirect(`/authors/${deletedAuthor.id}`)
        }
    }
})

module.exports = router 