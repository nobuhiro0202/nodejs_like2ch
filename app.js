const express = require("express");
const mysql = require("mysql");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  multipleStatements: true,
});

console.log(connection);

app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  if (req.session.userId === undefined) {
    res.locals.username = "ゲスト";
    res.locals.isLoggedIn = false;
  } else {
    res.locals.username = req.session.name;
    res.locals.user_level = req.session.user_level;
    res.locals.isLoggedIn = true;
  }
  next();
});

app.get("/", (req, res) => {
  console.log("fhmlmldrml");
  connection.query(
    "select * from comments join users on users.id = comments.userId;",
    (error, results) => {
      console.log(results);
      res.render("main.ejs", { comments: results });
    }
  );
});

app.post(
  "/",
  (req, res, next) => {
    if (req.session.userId === undefined) {
      res.redirect("/signup");
    } else {
      next();
    }
  },
  (req, res) => {
    var uid = req.session.userId;
    var comment = req.body.comment;
    connection.query(
      "insert into comments(userId, comment) values(?, ?) ; select * from comments join users on users.id = comments.userId;",
      [uid, comment],
      (error, results) => {
        console.log(results);
        res.render("main.ejs", { comments: results[1] });
      }
    );
  }
);

app.get("/signup", (req, res) => {
  res.render("signup.ejs", { errors: [] });
});

app.post(
  "/signup",
  (req, res, next) => {
    const username = req.body.username;
    const user_level = req.body.user_level;
    const email = req.body.email;
    const password = req.body.password;
    const errors = [];

    if (username === "") {
      errors.push("ユーザー名が空です");
    }

    if (user_level === "") {
      errors.push("ユーザーレベルが空です");
    }

    if (email === "") {
      errors.push("メールアドレスが空です");
    }

    if (password === "") {
      errors.push("パスワードが空です");
    }

    if (errors.length > 0) {
      res.render("signup.ejs", { errors: errors });
    } else {
      next();
    }
  },
  (req, res, next) => {
    const email = req.body.email;
    const errors = [];
    connection.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      (error, results) => {
        if (results.length > 0) {
          errors.push("ユーザー登録に失敗しました");
          res.render("signup.ejs", { errors: errors });
        } else {
          next();
        }
      }
    );
  },
  (req, res) => {
    const username = req.body.username;
    const user_level = req.body.user_level;
    const email = req.body.email;
    const password = req.body.password;
    bcrypt.hash(password, 10, (error, hash) => {
      connection.query(
        "INSERT INTO users (username, user_level, email, password) VALUES (?, ?, ?, ?);",
        [username, user_level, email, hash],
        (error, results) => {
          req.session.userId = results.insertId;
          req.session.name = username;
          req.session.user_level = user_level;
          res.redirect("/");
        }
      );
    });
  }
);

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  connection.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (error, results) => {
      console.log(error);
      console.log(results);
      if (results.length > 0) {
        const plain = req.body.password;
        const hash = results[0].password;
        bcrypt.compare(plain, hash, (error, isEqual) => {
          if (isEqual) {
            req.session.userId = results[0].id;
            req.session.name = results[0].username;
            req.session.user_level = results[0].user_level;
            res.redirect("/");
          } else {
            res.render("login.ejs");
          }
        });
      } else {
        res.redirect("/login");
      }
    }
  );
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    res.redirect("/");
  });
});

app.get("/users", (req, res) => {
  connection.query("select * from users", (error, results) => {
    res.render("users.ejs", { users: results });
  });
});

app.post("/delete", (req, res) => {
  const id = req.body.id;
  connection.query(
    "DELETE FROM users WHERE id=?",
    id,
    function (error, results, fields) {
      if (error) throw error;
      res.redirect("/users");
    }
  );
});

app.get("/comments", (req, res) => {
  connection.query(
    "select * from comments join users on users.id = comments.userId;",
    (error, results) => {
      console.log(results);
      res.render("comments.ejs", { comments: results });
    }
  );
});

app.listen(3001);
