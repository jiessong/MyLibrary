const mongoose = require('mongoose');
const Book = require('./book')

//define the schema
const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('findOneAndDelete', async function(next){
    _id = ''
    if(this._conditions){
        _id = this._conditions._id   //to get the author id
    }
    try{
        books = await Book.find({author: _id}).exec()
        console.log('books:',books._id)
        if(books.length > 0){
            next(new Error('This author has books still'))
        }else{
            next()
        }
    }catch(error){
        next(error)
    }
})

module.exports = mongoose.model('Author', authorSchema)