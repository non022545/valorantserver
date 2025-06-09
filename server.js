require('dotenv').config();
const express = require('express')
const app = express()
const mysql = require('mysql2')
const cors = require('cors')
const multer = require('multer')
const path = require('path')


app.use(cors())
app.use(express.json())

console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_PASSWORD:', process.env.MYSQL_PASSWORD ? '******' : null);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);

// เปลี่ยนจาก createConnection → เป็น createPool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    ssl: false,
    waitForConnections: true,
    connectionLimit: 10, // ตั้งจำนวน connection ได้ (10 กำลังดี)
    queueLimit: 0
});

// ตั้งค่า storage → ให้เก็บรูปใน folder 'uploads'
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

// ให้ express เสิร์ฟ static file ใน uploads folder ด้วย
app.use('/uploads', express.static('uploads'))


app.get('/stockvalorant', (req, res) => {
    pool.query("SELECT * FROM stockvalorant", (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send({ error: 'Database query failed' });
        } else {
            res.send(result);
        }
    });
});

app.post('/createid', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ error: 'File upload failed', details: err.message });
        }

        const { name, rankvalo, price, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        pool.query(
            "INSERT INTO stockvalorant (name, rankvalo, price, description, imageUrl) VALUES(?,?,?,?,?)",
            [name, rankvalo, price, description, imageUrl],
            (err, result) => {
                if (err) {
                    console.error('DB insert error:', err);
                    return res.status(500).send({ error: 'Database insert failed', details: err.message });
                }
                res.send("inserted");
            }
        );
    });
});




app.put('/updateid/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, rankvalo, price, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let sql = '';
    let params = [];

    if (imageUrl) {
        sql = 'UPDATE stockvalorant SET name=?, rankvalo=?, price=?, description=?, imageUrl=? WHERE id=?';
        params = [name, rankvalo, price, description, imageUrl, id];
    } else {
        sql = 'UPDATE stockvalorant SET name=?, rankvalo=?, price=?, description=? WHERE id=?';
        params = [name, rankvalo, price, description, id];
    }

    pool.query(sql, params, (err, result) => {
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
    pool.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send({ error: 'Failed to delete data' });
        } else {
            res.send({ success: true });
        }
    });
});


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
