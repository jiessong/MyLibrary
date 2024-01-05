const express = require('express');
const router = express.Router();
const multer = require('multer'); //used for file format
const path = require('path'); //used for file path
const fs = require('fs'); //file system used to delete files
const Book = require('../models/book');
const uploadPath = path.join('public', Book.coverImageBasePath) //set the path of the file
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'] //set the file type
const Author = require('../models/author');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {  //set upload destination
        callback(null, uploadPath)
    },
    filename: (req, file, callback) => {
        console.log(file);
        callback(null, Date.now()+path.extname(file.originalname)) //set the file name
    }
})
const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype));
    }
})

// All Books Route
router.get('/', async (req, res) => {
    console.log('1. books')
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
router.post('/', upload.single('cover'), async (req, res) => {
    console.log('req.file： '+req.file)
    const fileName = req.file!=null?req.file.filename:null  //get the file name
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description:req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName
    })

    try{
        console.log('2. book:', book)
        await book.save()
        res.redirect('books')
    }catch(error){
        console.log(error+' in creating book')
        removeBookCover(book.coverImageName) //delete the file if book is not created
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err) // don't worry about sending it to users
    })
}
 
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

module.exports = router 