const express = require('express');
const router = express.Router(); 
const Book = require('../models/book');
const Author = require('../models/author');
const book = require('../models/book');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'] //set the file type

router.delete('/:id', async (req, res) =>{
    console.log('delete router')
    let deletedBook
    try{
        deletedBook = await Book.findOneAndDelete({"_id":req.params.id})
        console.log('deletedBook:',deletedBook)
        res.redirect('/books')
    }catch(error){
        if(deletedBook != null){
            res.render('books/show', {book:book, errorMessage: 'Could not remove book'})
        }else{
            res.redirect('/')
        }
    }
})

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title!=null && req.query.title!=''){  //query in url
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if(req.query.publishedBefore!=null && req.query.publishedBefore!=''){ 
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if(req.query.publisherAfter!=null && req.query.publisherAfter!=''){ 
        query = query.gte('publishDate', req.query.publisherAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index', {books: books, searchOptions: req.query})
    }catch{
        redirect('/')
    }
})

//New Book Route
router.get('/new', async (req, res) => {
    const book = new Book()
    renderNewPage(res, book, hasError = false)
})

//Create Book Route
router.post('/',  async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description:req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
    })
    saveCover(book, req.body.cover)

    try{
        const newBook = await book.save()
        res.redirect('books')
    }catch(error){
        console.log(error+' in creating book')
        // removeBookCover(book.coverImageName) //delete the file if book is not created
        renderNewPage(res, book, true)
    }
})

//Update Book Route
router.put('/:id',  async (req, res) => {
    console.log('put router')
    let book

    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover!=null && req.body.cover!=''){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    }catch(error){
        console.log(error+' in updating book')
        if(book!=null){
            renderEditPage(res, book, true)
        }else{
            res.redirect('/')
        }
    }
})

router.get('/:id', async (req, res) =>{
    try{
        //populate is used to get the corresponding author information
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show', {book: book})
    }catch(err){
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) =>{
    console.log('edit page')
    try{
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    }catch{
        res.redirect('/books')
    }
})



async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError)
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError)
}

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) {
            if(form === 'edit'){
                params.errorMessage = 'Error Updating Book'
            }else{
                params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`books/${form}`, params)
    }catch(error){
        res.redirect('/books')
    }
}



function saveCover(book, coverEncoded){
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded) //parse the json string
    if(cover!=null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64') //convert the base64 string to buffer
        book.coverImageType = cover.type
    }
}

module.exports = router 