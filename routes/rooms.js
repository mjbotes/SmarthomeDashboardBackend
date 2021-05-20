var express = require('express');
var router = express.Router();
const sql = require('mssql/msnodesqlv8');

/* GET users listing. */

const config = {
    user: "shdAapp", // update me
    password: "SuperSecret!", // update me
    server: "tcp:smarthome-dashboard.database.windows.net", // update me
    database: "smarthome-dashboard-db;",
    driver: 'msnodesqlv8',
    options : {
        trustedConnection: false,
        encrypted: true
    }
};

router.post("/", (req, res) => {
    var roomName = req.body.roomName
    var userID = req.body.userID
    var url = req.body.url;
    var connection = new sql.ConnectionPool(config, async function (err) {
        try {
            await connection.connect()
            var r = new sql.Request(connection);
            r.input('roomName', sql.VarChar, roomName);
            r.input('userID', sql.Int, userID);
            r.multiple = false;
            r.query("insert Rooms(Name,UserID) values (@roomName, @userID)", function (err, recordsets) {
                console.log("done")
                connection.close();
            });
        } catch (error) {
            console.log(error.message)
        }

    });
    return res.status(200).send("Added")
});

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;