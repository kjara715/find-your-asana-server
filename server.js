const app= require("./app");

app.get('/', function(request, response) {
    const result = 'App is running'
    response.send(result);
})

app.listen(3001, function () {
    console.log('App on port 3001')
})

//to start server run nodemon server.js