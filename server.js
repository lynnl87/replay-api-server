var express = require('express');
const cors = require('cors')
var app = express();
var mysql = require('mysql2');
const config = require('./config');
const util = require('util');

var con = mysql.createConnection(config.db);

app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/v1/users/:username', function (request, response) {
  var username = request.params.username;
  con.query("SELECT DISTINCT(player) FROM replay_data", function (err, result, fields) {
    if (err) throw err;
    return response.send(result);
  });
});

app.get('/api/v1/users/:username/data', function (request, response) {
  var username = request.params.username;
  con.query(util.format("SELECT * FROM replay_data WHERE player = '%s'", username), function (err, result, fields) {
    if (err) throw err;
    return response.send(result);
  });
});

app.get('/api/v1/map_data/:username', function (request, response) {
  var username = request.params.username;
  con.query(util.format("SELECT \
    map_data.*,\
    maps.map_name,\
    replay_data.win\
    FROM\
      map_data\
    LEFT JOIN games ON map_data.games_id = games.id\
    LEFT JOIN maps ON games.map_id = maps.id\
    LEFT JOIN replay_data on replay_data.games_id = games.id \
    WHERE\
    map_data.player = '%s' AND replay_data.player = '%s'", username, username), function (err, result, fields) {
    if (err) throw err;
    return response.send(result);
  });
})

app.get('/api/v1/users/:username/vs/:opponent', function (request, response) {
  var username = request.params.username;
  var opponent = request.params.opponent
  console.log(username);
  con.query(util.format("SELECT \
    mp1.games_id, \
    ANY_VALUE(mp1.player) as team_one_player, \
    ANY_VALUE(mp1.hero) as team_one_hero, \
    ANY_VALUE(mp1.team) as team_one_team, \
    ANY_VALUE(mp1.win) as team_one_win, \
    ANY_VALUE(mp2.player) as team_two_player, \
    ANY_VALUE(mp2.hero) as team_two_hero, \
    ANY_VALUE(mp2.team) as team_two_team, \
    ANY_VALUE(mp2.win) as team_two_win \
FROM \
    replay_data mp1, \
    replay_data mp2 \
WHERE \
    mp1.games_id = mp2.games_id AND mp1.player != mp2.player AND(\
        mp1.player IN('%s') AND mp2.player IN('%s', '%s')\
    )\
GROUP BY mp1.games_id", username, opponent, username),  function (err, result, fields) {
    if (err) throw err;
    return response.send(result);
  });
});

var server = app.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port

  console.log("replay server listening at http://%s:%s", host, port)
})