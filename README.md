# replay-api-server

Purpose of this project is to create a simple nodejs server to pull data back from the database.

Current routes:
### /api/v1/users/{username}
Handles just getting distinct player data from the replay_data table.

### /api/v1/users/{username}/playerdata
Handles returning the rows from replay_data for a specific user.

### /api/v1/user_data/{username}
Handles returning specific data from replay_data where the user played in the same game as the user 'Squacoon'
