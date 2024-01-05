const express = require('express');
const Book = require('../models/book');
const router = express.Router();

// Home page
router.get('/', async (req, res) => {
    let books = []
    try{
        books = await Book.find().sort({createAt: 'desc'}).limit(10).exec()
    }catch{
        books = []
    }
    res.render('index', {books:books})
})

module.exports = router 