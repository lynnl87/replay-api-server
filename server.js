var express = require('express');
var app = express();
var mysql = require('mysql2');
const config = require('./config');
var con = mysql.createConnection(config.db);

app.get('/v1/users/:username', function(request, response) {
    var username = request.params.username;
    console.log(username);
      con.query("SELECT DISTINCT(player) FROM replay_data", function (err, result, fields) {
        if (err) throw err;
        return response.send(result);
      });
    console.log("weird");
    //response.send('Hello DELETE');
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
})