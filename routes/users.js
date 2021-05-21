var express = require("express");
var router = express.Router();
const sql = require('mssql/msnodesqlv8');
const configA = require('./config');


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

router.post("/", (req, res) => {
  var fName = req.body.fName;
  var surname = req.body.surname;
  var email = req.body.email;
  var connection = new sql.ConnectionPool(config, async function (err) {
    try {
      await connection.connect();
      var r = new sql.Request(connection);
      r.input("fName", sql.VarChar, fName);
      r.input("surname", sql.VarChar, surname);
      r.input("email", sql.VarChar, email);
      r.multiple = false;
      r.query(
        "insert Users(FirstName,Surname,Email) values (@fName, @surname, @email)",
        function (err, recordsets) {
          console.log("done");
          connection.close();
        }
      );
    } catch (error) {
      console.log(error.message);
      res.status(400).send(error.message);
    }
  });
  return res.status(200).send("Added");
});

router.get("/id/", loggedIn, (req, res) => {
  var connection = new sql.ConnectionPool(config, async function (err) {
    await connection.connect().catch((err) => {
      console.log(err);
      return res.status(400).send(err);
    });
    var r = new sql.Request(connection);
    r.input("user", sql.Int, req.query.userId);
    var ret = await r
      .query("SELECT * FROM Users WHERE UserId=@user")
      .then((result) => {
        console.log(result.recordset);
        return res.status(200).send(result.recordset);
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).send(err);
      });

    return res;
  });
});

router.get('/', loggedIn ,function(req, res, next) {
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
