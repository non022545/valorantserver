require('dotenv').config();
const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')

app.use(cors({
    origin: 'http://localhost:3000' //
}));
app.options('*', cors());

app.use(express.json())

console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '******' : null);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);


const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
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
            console.log(err);
            return res.status(500).send({ error: 'Database error' });
        } else {
            res.status(200).send(result);
        }
    })
})
console.log({ name, rank, price, description })

app.post('/createid', (req, res) => {
    console.log("POST /createid received data:", req.body)

    const { name, rank, price, description } = req.body

    db.query(
        "INSERT INTO stockvalorant (name, rank, price, description) VALUES (?, ?, ?, ?)",
        [name, rank, price, description],
        (err, result) => {
            if (err) {
                console.error("DB insert error:", err)
                return res.status(500).json({ error: 'Database insert error' })
            }
            console.log("DB insert success:", result)
            res.status(201).json({ message: 'Inserted successfully', id: result.insertId })
        }
    )
})


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
