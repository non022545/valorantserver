require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());


{/**************************************************   ตั้งค่า Cloudinary   *************************************************/ }

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

{/**************************************************   ตั้งค่า multer-storage-cloudinary   *************************************************/ }

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'stockvalorant',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
});

const upload = multer({ storage });

{/**************************************************   MySQL pool   *************************************************/ }

// const pool = mysql.createPool({
//     host: process.env.MYSQL_HOST,
//     user: process.env.MYSQL_USER,
//     password: process.env.MYSQL_PASSWORD,
//     database: process.env.MYSQL_DATABASE,
//     port: process.env.MYSQL_PORT,
//     ssl: false,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });


{/**************************************************   PostgreSQL pool   *************************************************/ }
const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
    ssl: false
});

{/**************************************************   Routes   *************************************************/ }
// 


app.get('/stockvalorant', (req, res) => {
    pool.query("SELECT * FROM stockvalorant", (err, result) => {
        if (err) {
            res.status(500).send({ error: 'Database query failed' });
        } else {
            res.send(result.row);
        }
    });
});

{/**************************************************   Create   *************************************************/ }
app.post('/createid', upload.single('image'), (req, res) => {
    const { user_name, name, rankvalo, cost_price, selling_price, profit_price, link_user, description, status, purchase_date, sell_date } = req.body;
    const imageUrl = req.file ? req.file.path : null;
    
    if (!rankvalo) {
        return res.status(400).send({ error: "rankvalo is required" });
    }

    const sql = `
        INSERT INTO stockvalorant 
        (user_name, name, rankvalo, cost_price, selling_price, profit_price, link_user, description, status, imageurl, purchase_date, sell_date) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `;

    const params = [user_name, name, rankvalo, cost_price, selling_price, profit_price, link_user, description, status, imageUrl, purchase_date, sell_date];

    pool.query(sql, params, (err, result) => {
        if (err) {
            res.status(500).send({ error: 'Database insert failed', details: err });
        } else {
            res.send("inserted");
        }
    });
});


{/**************************************************   Update   *************************************************/ }
app.put('/updateid/:id', upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { user_name, name, rankvalo, cost_price, selling_price, profit_price, link_user, description, status, purchase_date, sell_date } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    let sql = '';
    let params = [];

    if (imageUrl) {
        sql = `
          UPDATE stockvalorant SET 
            user_name=$1, name=$2, rankvalo=$3, cost_price=$4, selling_price=$5, profit_price=$6, link_user=$7, 
            description=$8, status=$9, imageurl=$10, purchase_date=$11, sell_date=$12 
          WHERE id=$13
        `;
        params = [user_name, name, rankvalo, cost_price, selling_price, profit_price, link_user, description, status, imageUrl, purchase_date, sell_date, id];
    } else {
        sql = `
          UPDATE stockvalorant SET 
            user_name=$1, name=$2, rankvalo=$3, cost_price=$4, selling_price=$5, profit_price=$6, link_user=$7, 
            description=$8, status=$9, purchase_date=$10, sell_date=$11 
          WHERE id=$12
        `;
        params = [user_name, name, rankvalo, cost_price, selling_price, profit_price, link_user, description, status, purchase_date, sell_date, id];
    }

    pool.query(sql, params, (err, result) => {
        if (err) {
            res.status(500).send({ error: 'Failed to update data', details: err });
        } else {
            res.send({ success: true });
        }
    });
});


{/**************************************************   Delete   *************************************************/ }

aapp.delete('/deleteid/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM stockvalorant WHERE id = $1';
    pool.query(sql, [id], (err, result) => {
        if (err) {
            res.status(500).send({ error: 'Failed to delete data', details: err });
        } else {
            res.send({ success: true });
        }
    });
});



{/**************************************************   Run server port   *************************************************/ }



const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
