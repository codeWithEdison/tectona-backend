const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt  = require("jsonwebtoken");

const app = express();
// middle to parse json data 
app.use(express.json());

// database  connection  
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "tectona",
  port: 3307,
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to the database: ", err);
  } else {
    console.log("Connected to the database successfully!");
  }
});

app.get("/", (req, res) => {
  res.send("Welcome to  our Tectona API ...");
});

app.get("/api/users", (req, res) => {
  let sql = "select * from users";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send("Error fetching users: " + err);
    } else {
      res.status(200).json(result);
    }
  });
});

// todos: add  routes for get  all clients
app.get("/api/clients", (req, res) => {
  let sql = "select * from clients";
  db.query(sql, (err, result) => {
    if (err) {
      res.status(500).send("Error fetching clients: " + err);
    } else {
      res.status(200).json(result);
    }
  });
});

app.post("/api/register", (req, res) => {
  const { username, password, email, role } = req.body;
  let hashedpassword = bcrypt.hashSync(password, 8);
  let sql ="insert into users (username, password, email, role) values (?, ?, ?, ?)";
  /*
   let name = 'john doe'
   console.log(name) = john doe;
  */

  db.query(sql, 
    [username, hashedpassword, email, role],
    (err, result)=>{
        if (err) {
            res.status(500).send("Error registering user: " + err);
        } else {
            res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId,
            });
        }
    }
  );
//   let sql = `insert into users
//      (username, password, email, role)
//       values (${username}, ${password}, ${email}, ${role})`;
});

  /*
todo: this is same as :
const username = req.body.username;
const password = req.body.password;
const email = req.body.email;
const role = req.body.role;


    */
// });


app.post('/api/login', (req, res) =>{
    const{username, password} = req.body;
    const sql = 'select * from users where username = ?';
    db.query(sql, username, (err, result) =>{
        if(err){
            res.status(500).send("Error logging in: " + err);
        }

        if(result.length === 0){
            res.status(401).send("Invalid username or password");
        }
        // [{}]

        const user = result[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if(!isPasswordValid){
            res.status(401).send("Invalid username or password");
        }
        // Generate a token
        const token  = jwt.sign(
            {id: user.userid, username: user.username, role: user.role},
            'your_jwt_secret_key',
            {expiresIn: '1h'}
        ); 
        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.userid,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
        
    })
})

// enpoint 

app.listen(5000, () => {
  console.log("Server is running on port 5000 and u are welcome ...");
});
