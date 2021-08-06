
const path = require('path');
const express = require('express');




const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

const { ExpressError } = require('./expressError');

const userRoutes= require('./routes/users');
const postRoutes = require('./routes/posts');
const authRoutes= require('./routes/auth');
const {authenticateJWT} = require('./middleware/auth');



const cors = require('cors');
app.use(cors());
// Have Node serve the files for our built React app
//app.use(express.static(path.resolve(__dirname, 'frontend/yoga_app/build')))
app.use(express.static(path.join(__dirname, 'frontend/yoga_app/build')));
app.use(express.json());


// app.use(express.json({limit: '50mb'}))
// app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}))
app.use(authenticateJWT)


app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/auth', authRoutes)


app.use((req, res, next) => {
    const e = new ExpressError("Page Not Found", 404);
    next(e)
})

app.use((error, req, res, next) => {
    let status = error.status || 500;
    let message = error.message;
   return  res.status(status).json({
       error: {message, status}
   })
})
//


module.exports = app;