const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')
require('dotenv').config();

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  ssl: false
});



db.connect(err => {
    if (err) {
        console.error('❌ Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('✅ Connected to MySQL database');
});


app.get('/stockvalorant', (req, res) => {

    db.query("SELECT * FROM stockvalorant", (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send(result)
        }
    })
})

app.post('/createid', (req, res) => {
    const name = req.body.name;
    const rank = req.body.rank;
    const price = req.body.price;
    const description = req.body.description;
    db.query("INSERT INTO stockvalorant (name, rank, price, description) VALUES(?,?,?,?)", [name, rank, price, description], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.send("inserted")
        }
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
