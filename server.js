require('dotenv').config();
const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')

app.use(cors())
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
            console.log(err)
        } else {
            res.send(result)
        }
    })
})

app.post('/createid', (req, res) => {
    console.log(req.body); // ดูข้อมูลที่ส่งมา
    const name = req.body.name;
    const rankvalo = req.body.rankvalo;
    const price = req.body.price;
    const description = req.body.description;
    db.query("INSERT INTO stockvalorant (name, rankvalo, price, description) VALUES(?,?,?,?)", [name, rankvalo, price, description], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error: 'Database insert failed', details: err });
        } else {
            res.send("inserted");
        }

    })
})

app.put('/updateid/:id', (req, res) => {
  const { id } = req.params;
  const { name, rankvalo, price, description } = req.body;
  const sql = 'UPDATE stockvalorant SET name=?, rankvalo=?, price=?, description=? WHERE id=?';
  db.query(sql, [name, rankvalo, price, description, id], (err, result) => {
    if (err) {
      res.status(500).send({ error: 'Failed to update data' });
    } else {
      res.send({ success: true });
    }
  });
});

app.delete('/deleteid/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM stockvalorant WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).send({ error: 'Failed to delete data' });
    } else {
      res.send({ success: true });
    }
  });
});



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
