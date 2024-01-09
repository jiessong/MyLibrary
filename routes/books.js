const express = require('express');
const router = express.Router(); 
const Book = require('../models/book');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'] //set the file type

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
    const fileName = req.file!=null?req.file.filename:null  //get the file name
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description:req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
    })
    saveCover(book, req.body.cover)

    try{
        await book.save()
        res.redirect('books')
    }catch(error){
        console.log(error+' in creating book')
        // removeBookCover(book.coverImageName) //delete the file if book is not created
        renderNewPage(res, book, true)
    }
})

// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath, fileName), err => {
//         if(err) console.error(err) // don't worry about sending it to users
//     })
// }
 
//encapculate the renderNewPage function
async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) {
            params.errorMessage = 'Error Creating Book'
        }
        res.render('books/new', params)
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