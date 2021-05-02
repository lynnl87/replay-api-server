var express = require('express');
const cors = require('cors')
var app = express();
var mysql = require('mysql2');
const config = require('./config');
var con = mysql.createConnection(config.db);

app.use(cors());
app.get('/api/v1/users/:username', function(request, response) {
    var username = request.params.username;
      con.query("SELECT DISTINCT(player) FROM replay_data", function (err, result, fields) {
        if (err) throw err;
        return response.send(result);
      });
    console.log("Previous command is async?");
    //response.send('Hello DELETE');
});

app.get('/api/v1/user_data/:username', function(request, response) {
  var username = request.params.username;
  console.log(username);
    con.query("SELECT DISTINCT(hero), COUNT(hero) as totalPlayed , SUM(win = 2) as wins FROM `replay_data` WHERE player ='" + username + "' group by hero order by totalPlayed desc", function (err, result, fields) {
      if (err) throw err;
      return response.send(result);
    });
  console.log("Previous command is async?");
  //response.send('Hello DELETE');
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
  
   console.log("Example app listening at http://%s:%s", host, port)
})