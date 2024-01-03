if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()  //load all variables from .env file
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');

//import router
const indexRouter = require('./routes/index');


app.set("view engine", 'ejs')  //view file format
app.set('views', __dirname + '/views');  //views folder
app.set('layout', 'layouts/layout');  //layout file  
app.use(expressLayouts);    //express layout
app.use(express.static('public')); //styles folder

//import and connect to mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', error=> console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter);  //home page


app.listen(process.env.PORT || 3000)  //deplooyment & development port
