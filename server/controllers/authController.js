const db = require('../../models/TrailModel');
const bcrypt = require('bcrypt');

const saltRounds = 10;

module.exports = {

  createPassword: function (req, res, next) {
    const { username, password, location } = req.body;
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) return next(err);
      req.body = { username, hash, location }
      return next();
    });
  },

  checkPassword: function (req, res, next) {
    const { username, password } = req.body;
    const text = `SELECT * FROM Users WHERE (username=$1)`;
    let data;
      db.query(text, [username])
        .then(user => {
          data = user;
          bcrypt.compare(password, data.rows[0].user_pw, function(err, user) {
            if (err) return next(err);
            console.log(username);
            res.locals.result = { bool: user, location: data.rows[0].home_zip, user_id: data.rows[0].user_id };
            return next();
          });
        })
        .catch(err => next({ error: err }))
  },

  storeUserInfo: function (req, res, next) {
    const { username, hash, location } = req.body;
    const text = `INSERT INTO Users (username, user_pw, home_zip) VALUES ($1, $2, $3)`;
    db.query(text, [username, hash, location ])
    .then(() => next())
    .catch(err => next({ error: err }));
  }
}