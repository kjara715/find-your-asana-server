const app= require("./app");
const {PORT} = require("./config")


app.get('/', function(request, response) {
    const result = 'App is running'
    response.send(result);
});



app.listen(PORT, function () {
    console.log(`App on port ${PORT}`)
})

//to start server run nodemon server.js