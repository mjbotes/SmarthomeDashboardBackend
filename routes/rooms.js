var express = require("express");
var router = express.Router();
const sql = require('mssql/msnodesqlv8');
const configA = require('../config');
/* GET users listing. */

const config = {
  user: "shdAapp", // update me
  password: "SuperSecret!", // update me
  server: "tcp:smarthome-dashboard.database.windows.net", // update me
  database: "smarthome-dashboard-db;",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: false,
    encrypted: true,
  },
};

router.get("/userId/", (req, res) => {
  var connection = new sql.ConnectionPool(config, async function (err) {
    await connection.connect().catch((err) => {
      console.log(err);
      return res.status(400).send(err);
    });
    var r = new sql.Request(connection);
    r.input("user", sql.Int, req.query.userId);
    var ret = await r
      .query("SELECT * FROM Rooms WHERE UserID=@user")
      .then((result) => {
        console.log(result.recordsets);
        return res.status(200).send(result.recordset);
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).send(err);
      });

    return res;
  });
});

router.post("/", (req, res) => {
  var roomName = req.body.roomName;
  var userID = req.body.userID;
  var connection = new sql.ConnectionPool(config, async function (err) {
    try {
      await connection.connect();
      var r = new sql.Request(connection);
      r.input("roomName", sql.VarChar, roomName);
      r.input("userID", sql.Int, userID);
      r.multiple = false;
      r.query(
        "INSERT INTO Rooms(RoomName,UserID) VALUES (@roomName, @userID)",
        function (err, recordsets) {
          console.log("done");
          connection.close();
        }
      );
      res.status(200).end("Added");
    } catch (error) {
      throw error;
    }
  });
});

router.get('/',loggedIn,function(req, res, next) {
  res.send('respond with a resource');
});

function loggedIn(req, res, next) {
    if (req.cookies[configA.COOKIE_NAME]) {
        next();
    } else {
        res.redirect(configA.SERVER_ROOT_URI+'/auth/google/url');
    }
  }
module.exports = router;
