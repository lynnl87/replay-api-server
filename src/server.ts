import express, { Express } from "express";
import cors from "cors"
import * as mysql from "mysql2/promise"
import * as util from "util";
import * as dotenv from "dotenv";
import { AddressInfo } from "net";
import { GetReplayName, LastFewGames } from "./queries";
import { Server } from "http";
import CacheSystem from "./cache"
import * as hots from "hots-parser";
import path from "path";
import { Response } from "express-serve-static-core";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerFile = YAML.load('openapi.yml');
const cacheSytem: CacheSystem = new CacheSystem(25);
const PROCESSED = '/media/sf_vmdata/processed';
const app: Express = express();
dotenv.config();

const con: mysql.Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME
});

async function executeQueryAndCache(query: string, response: Response<unknown, Record<string, unknown>, number>, sendResponse: boolean) {
  if (cacheSytem.doesExistInDictionary(query)) {
    if (sendResponse) {
      return response.send(cacheSytem.getResultsFromCache(query));
    }

    return cacheSytem.getResultsFromCache(query);
  }

  try {
    const [rows,] = await con.execute(query);
    cacheSytem.addEntryToCache(query, rows)
    if (sendResponse) {
      return response.send(rows);
    }

    return rows;
  }
  catch {
    return response.sendStatus(500);
  }
}

app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/api/v1/replays/last/:count', function (request, response) {
  const amountToGet: string = request.params.count;
  executeQueryAndCache(util.format(LastFewGames, amountToGet), response, true);
});

app.get('/api/v1/replays/data/:mapId', async function (request, response) {
  const mapId: string = request.params.mapId;
  if (mapId === undefined) {
    return response.send("No url parameter");
  }

  const result = await executeQueryAndCache(util.format(GetReplayName, mapId), response, false);
  if (result === undefined || result === null) {
    return response.sendStatus(500);
  }

  // Map was found. Lets find the replay.
  try {
    const details = hots.parse(path.join(PROCESSED, result[0].replayName), ['details'], {});
    const parsedReplay = hots.processReplay(path.join(PROCESSED, result[0].replayName), { "overrideVerifiedBuild": true });
    const players = { "players": details.details.m_playerList };
    const otherJunk2 = { "match": parsedReplay.match };
    const otherJunk = { "details": parsedReplay.players };
    const returnValue = Object.assign({}, otherJunk2, otherJunk, players, hots.parse(path.join(PROCESSED, result[0].replayName), ['messageevents'], {}));
    return response.send(returnValue);
  }
  catch (error) {
    console.log(error);
    return response.sendStatus(500);
  }
});

// OpenAPI UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

const server: Server = app.listen(8081, function () {
  const host: string = (<AddressInfo>server.address()).address
  const port: number = (<AddressInfo>server.address()).port

  console.log("replay server listening at http://%s:%s", host, port)
})