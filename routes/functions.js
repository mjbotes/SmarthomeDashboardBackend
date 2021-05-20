var express = require("express");
var router = express.Router();
const sql = require("mssql/msnodesqlv8");

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

router.get("/deviceId/", (req, res) => {
  var connection = new sql.ConnectionPool(config, async function (err) {
    await connection.connect().catch((err) => {
      console.log(err);
      return res.status(400).send(err);
    });
    var r = new sql.Request(connection);
    r.input("device", sql.Int, req.query.deviceId);
    var ret = await r
      .query("SELECT * FROM DeviceFunctions WHERE DeviceID=@device")
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

router.post("/", async (req, res) => {
  var functionName = req.body.functionName;
  var parameter = req.body.parameter;
  var deviceID = req.body.deviceID;
  try {
    var connection = new sql.ConnectionPool(config);
    await connection.connect();
    var r = new sql.Request(connection);
    r.input("functionName", sql.VarChar, functionName);
    r.input("parameter", sql.VarChar, parameter);
    r.input("deviceID", sql.Int, deviceID);
    r.multiple = false;
    await r.query(
      "insert DeviceFunctions(Name,Parameter, DeviceID) values (@functionName, @parameter, @deviceID)"
    );
  } catch (error) {
    return res.status(400).send(error.message);
  }
  return res.status(200).send("added");
});

router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;
