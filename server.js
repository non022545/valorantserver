require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// ตั้งค่า Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ตั้งค่า multer-storage-cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'stockvalorant',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});

const upload = multer({ storage });

// MySQL pool
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    ssl: false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Routes
app.get('/stockvalorant', (req, res) => {
    pool.query("SELECT * FROM stockvalorant", (err, result) => {
        if (err) {
            res.status(500).send({ error: 'Database query failed' });
        } else {
            res.send(result);
        }
    });
});

app.post('/createid', upload.single('image'), (req, res) => {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    const { name, rankvalo, price, description } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!rankvalo) {
        return res.status(400).send({ error: "rankvalo is required" });
    }

    pool.query(
        "INSERT INTO stockvalorant (name, rankvalo, price, description, imageUrl) VALUES(?,?,?,?,?)",
        [name, rankvalo, price, description, imageUrl],
        (err, result) => {
            if (err) {
                res.status(500).send({ error: 'Database insert failed', details: err });
            } else {
                res.send("inserted");
            }
        }
    );
});


app.put('/updateid/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, rankvalo, price, description } = req.body;
    const imageUrl = req.file ? req.file.path : null;

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

// Run server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
