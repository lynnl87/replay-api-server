export const LastFewGames = 'SELECT rd.*, subq.*, m.*, p.* FROM replay_data as rd \
    inner join( \
        SELECT * FROM games ORDER BY timestamp DESC LIMIT %d \
    ) AS subq ON rd.games_id = subq.id \
    JOIN maps as m on subq.map_id = m.id \
    JOIN players as p on rd.player = p.id \
    ORDER BY subq.timestamp DESC, rd.team DESC;'

export const GetReplayName = 'SELECT replayName FROM games WHERE id = %d';