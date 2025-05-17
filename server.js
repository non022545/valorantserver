const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')

app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "idvalorant"
})

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

const port = 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))