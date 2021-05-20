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
    var deviceName = req.body.deviceName
    var roomID = req.body.roomID
    var url = req.body.url;
    var connection = new sql.ConnectionPool(config, async function (err) {
        try {
            await connection.connect()
            var r = new sql.Request(connection);
            r.input('deviceName', sql.VarChar, deviceName);
            r.input('url', sql.VarChar, url);
            r.input('roomID', sql.Int, roomID);
            r.multiple = false;
            r.query("insert Devices(Name,Url,RoomID) values (@deviceName, @url, @roomID)", async function (err, recordsets) {
                console.log("done")
                connection.close()
            })
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
