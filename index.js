'use strict';

const express = require('express');
const mssql = require('mssql');


const firebaseFunc = require('firebase-functions');
const firebaseAdmin = require('firebase-admin');

firebaseAdmin.admin.initializeApp(firebaseFunc.functions.config().firebase)

const app = express();
app.set('view engine', 'pug');
app.enable('trust proxy');
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use((req, res, next) => {
  res.set('Content-Type', 'application/json');
  next();
});

const db = firebaseAdmin.admin.firestore()
export const webApi=firebaseFunc.https.onRequest(app)


const createPool = async () => {
  const config = {pool: {}};
  config.user = process.env.DB_USER;
  config.password = process.env.DB_PASS;
  config.database = process.env.DB_NAME;
  config.server = process.env.DEPLOYED ? '172.17.0.1' : '127.0.0.1';
  config.port = 1433;
  config.connectionTimeout = 30000;
  config.pool.acquireTimeoutMillis = 30000;
  (config.pool.idleTimeoutMillis = 600000),
    (config.pool.max = 5);
  config.pool.min = 1;
  config.pool.createRetryIntervalMillis = 200;
  return await mssql.connect(config);
};

app.post("/device", (req, res) => {
  try {
    const stmt =
      'INSERT INTO devices (deviceName, url, userId) VALUES (@deviceName, @url, @userId)';
    const ps = new mssql.PreparedStatement(pool);
    ps.input('deviceName', mssql.VarChar(50));
    ps.input('url', mssql.VarChar(256));
    ps.input('userId', mssql.ID)
    await ps.prepare(stmt);
    await ps.execute({
      deviceName: req.deviceName,
      url: req.url,
      userId: req.userId
    });
    await ps.unprepare();
  } catch (err) {
  }
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
