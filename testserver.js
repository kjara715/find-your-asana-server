const express = require('express');

const app = express();

//these two portions tell express how to parse the body
//for json data
app.use(express.json())
//parse the body as form data if it is form data
app.use(express.urlencoded({extended: true}))

app.get('/', function(req, res){
    return res.send("HIIII");
    
})

app.post('/chickens', (req, res) => {
    return res.send("you created a new chicken (post request)");
    
})

app.get('/chickens', (req, res) => {
    res.send("bock bock!!! (get request)")
})

app.get('/users/:username', (req,res) => {
    const thisUser = req.params.username;
    res.send(`hi user ${thisUser}`);

})

app.post('/register', (req, res) => {
    res.send(req.body)
})

app.get('/search', (req, res) => {
    //can destructure and also add defaults
    const {term = 'human', sort='top'} = req.query
    return res.send(`Search page. term is ${term}. sort is ${sort}`)
})

app.listen(3000, function () {
    console.log('App on port 3000')
})
