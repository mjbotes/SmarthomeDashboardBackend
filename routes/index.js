


const sql = require('mssql/msnodesqlv8');
const express = require("express");
const jwt = require("jsonwebtoken");
const axios= require("axios");
const querystring =require("querystring");
const cookieParser =require("cookie-parser");
var router = express.Router();

var config = require("../config");

/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;

router.use(cookieParser());

const redirectURI = "login/oauth2/code/google";

//Router to the current user by decoding the jwt that was appended during signing in

router.get("/authenticated/user",loggedIn,(req,res,next)=>{
    try {
      const decodedToken = jwt.verify(req.cookies[config.COOKIE_NAME],config.JWT_SECRET);
      console.log(decodedToken.email);
      return res.send(decodedToken.email);
    } catch (error) {
        console.log(err);
        return res.sendStatus(401);
    }
});


// Router to generate the login url
router.get("/auth/google/url", (req, res) => {
  return res.redirect(getGoogleAuthURL());
});

//Router to get the tokens

router.get(`/${redirectURI}`, async (req, res) => {
  const code = req.query.code ;

  const { id_token, access_token } = await getTokens({
    code,
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    redirectUri: `${config.SERVER_ROOT_URI}/${redirectURI}`,
  });

// Fetch the user's profile with the access token and bearer
const googleUser = await axios
  .get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
    )
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch user`);
      throw new Error(error.message);
    });

    if(getUserId(googleUser.email) != null)
    {
       createUser(googleUser.given_name,googleUser.family_name,googleUser.email);
    }
    const token = jwt.sign(googleUser, config.JWT_SECRET);

    res.cookie(config.COOKIE_NAME, token, {
      maxAge: 900000,
      httpOnly: false,
      secure: true,
    });
    res.redirect(config.UI_ROOT_URI);
});

//generates the login url

function getGoogleAuthURL() {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: `${config.SERVER_ROOT_URI}/login/oauth2/code/google`,
      client_id: config.GOOGLE_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
    };

    return `${rootUrl}?${querystring.stringify(options)}`;
}


//Gets the token from google

function getTokens({
    code,
    clientId,
    clientSecret,
    redirectUri,
    }) {


    const url = 'https://oauth2.googleapis.com/token';
    const values = {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    return axios
      .post(url, querystring.stringify(values), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .then((res) => res.data)
      .catch((error) => {
        throw new Error(error.message);
      });
}

//Check if the user is signed by looking for a cookie(for now)

function loggedIn(req, res, next) {
    if (req.cookies[config.COOKIE_NAME]) {
        next();
    } else {
        res.redirect(getGoogleAuthURL());
    }
}

//For getting userId
function getUserId(email){
  var connection = new sql.ConnectionPool(config, async function (err) {
    await connection.connect()
    var r = new sql.Request(connection);
    r.input('email', sql.VarChar,email);
    console.log(email)
    var ret = await r.query("SELECT * FROM Users WHERE Email=@email").then(result => {
      if(result !=null)
        return result.recordset.UserId;
      else
         return null;
    }).catch(err => {
      console.log(err)
    });
  });
}

// Hopefully it will create a user
function createUser(fName,surname,email){
  var connection = new sql.ConnectionPool(config, async function (err) {
    try {
      await connection.connect()
      var r = new sql.Request(connection);
      r.input('fName', sql.VarChar, fName);
      r.input('surname', sql.VarChar, surname);
      r.input('email', sql.VarChar, email);
      r.multiple = false;
      r.query("insert Users(FirstName,Surname,Email) values (@fName, @surname, @email)", function (err, recordsets) {
        console.log("done")
        connection.close();
      });
    } catch (error) {
      console.log(error.message)
    
    }
  });
  }


