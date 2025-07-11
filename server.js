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

function parseDateOrNull(input) {
  if (!input || input === "null" || input.trim() === "") return null;
  // ถ้าเป็น string รูปแบบ 'YYYY-MM-DD HH:mm:ss' ถือว่าใช้ได้เลย
  return input;
}


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
const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});


{/**************************************************   Get API Admin  *************************************************/ }

app.get('/admin_Npass_non0625232145/stockvalorant', (req, res) => {
    pool.query("SELECT * FROM stockvalorant ORDER BY id ASC", (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send({ error: 'Database query failed File .env error', details: err.message });
        }
        res.send(result.rows);
    });
});

{/**************************************************   Get API Client  *************************************************/ }

app.get('/stockvalorant', (req, res) => {
    pool.query("SELECT id, name, rankvalo, selling_price, description, imageurl FROM stockvalorant  ORDER BY id ASC", (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send({ error: 'Database query failed File .env error', details: err.message });
        }
        res.send(result.rows);
    });
});

{/**************************************************   API Render   *************************************************/ }
app.get('/admin_Npass_non0625232145/stockvalorant/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM stockvalorant WHERE id = $1', [id], (err, result) => {
        if (err) {
            console.error('Error fetching item by id:', err);
            return res.status(500).send({ error: 'Database error' });
        }
        if (result.rows.length === 0) {
            return res.status(404).send({ error: 'Item not found' });
        }
        res.send(result.rows[0]);
    });
});


{/**************************************************   Create   *************************************************/ }
app.post('/admin_Npass_non0625232145/createid', upload.single('image'), (req, res) => {
    const imageUrl = req.file?.path || null;
    console.log('Image URL:', imageUrl);

    const {
        user_name, name, rankvalo, cost_price,
        selling_price, profit_price, link_user,
        description, status, purchase_date, sell_date
    } = req.body;

    const costPriceNum = Number(cost_price);
    const sellingPriceNum = Number(selling_price);
    const profitPriceNum = Number(profit_price);
    const purchaseDateValue = parseDateOrNull(purchase_date);
    const sellDateValue = parseDateOrNull(sell_date);

    const sql = `
        INSERT INTO stockvalorant
        (user_name, name, rankvalo, cost_price, selling_price, profit_price, link_user, description, status, purchase_date, sell_date, imageurl)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    `;

    const params = [
        user_name, name, rankvalo, costPriceNum, sellingPriceNum, profitPriceNum,
        link_user, description, status, purchaseDateValue, sellDateValue, imageUrl
    ];

    pool.query(sql, params, (err, result) => {
        if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({
                error: 'Database insert failed',
                message: err.message,
                detail: err.detail,
                hint: err.hint,
                stack: err.stack
            });
        }
        res.send("inserted");
    });
});

{/**************************************************   Update   *************************************************/ }

app.put('/admin_Npass_non0625232145/updateid/:id', upload.single('image'), (req, res) => {
    const imageUrl = req.file?.path || null;
    console.log('Image URL:', imageUrl);

    const {
        user_name, name, rankvalo, cost_price,
        selling_price, profit_price, link_user,
        description, status, purchase_date, sell_date
    } = req.body;

    const id = req.params.id;

    const costPriceNum = Number(cost_price);
    const sellingPriceNum = Number(selling_price);
    const profitPriceNum = Number(profit_price);
    const purchaseDateValue = parseDateOrNull(purchase_date);
    const sellDateValue = parseDateOrNull(sell_date);

    // ถ้ามี imageUrl ให้ update ด้วย, ถ้าไม่มีจะไม่แก้ไข imageurl
    const sql = imageUrl
        ? `
            UPDATE stockvalorant SET
                user_name = $1,
                name = $2,
                rankvalo = $3,
                cost_price = $4,
                selling_price = $5,
                profit_price = $6,
                link_user = $7,
                description = $8,
                status = $9,
                purchase_date = $10,
                sell_date = $11,
                imageurl = $12
            WHERE id = $13
        `
        : `
            UPDATE stockvalorant SET
                user_name = $1,
                name = $2,
                rankvalo = $3,
                cost_price = $4,
                selling_price = $5,
                profit_price = $6,
                link_user = $7,
                description = $8,
                status = $9,
                purchase_date = $10,
                sell_date = $11
            WHERE id = $12
        `;

    const params = imageUrl
        ? [
            user_name, name, rankvalo, costPriceNum, sellingPriceNum, profitPriceNum,
            link_user, description, status, purchaseDateValue, sellDateValue, imageUrl, id
        ]
        : [
            user_name, name, rankvalo, costPriceNum, sellingPriceNum, profitPriceNum,
            link_user, description, status, purchaseDateValue, sellDateValue, id
        ];

    pool.query(sql, params, (err, result) => {
        if (err) {
            console.error('Update error:', err);
            return res.status(500).json({
                error: 'Database update failed',
                message: err.message,
                detail: err.detail,
                hint: err.hint,
                stack: err.stack
            });
        }

        res.send("updated");
    });
});



{/**************************************************   Update   *************************************************/ }
// app.put('/admin_Npass_non0625232145/updateid/:id', upload.single('image'), (req, res) => {
//     const { id } = req.params;
//     console.log('📝 Update request body:', req.body);
//     console.log('📝 Update image file:', req.file);

//     const {
//         user_name, name, rankvalo, cost_price, selling_price, profit_price,
//         link_user, description, status, purchase_date, sell_date
//     } = req.body;

//     const imageUrl = req.file ? req.file.path : null;

//     const purchaseDateValue = parseDateOrNull(purchase_date);
//     const sellDateValue = parseDateOrNull(sell_date);

//     // ถ้ามี imageUrl ให้ update พร้อม ถ้าไม่มีก็ไม่แก้ไข imageurl
//     let sql;
//     let params;

//     if (imageUrl) {
//         sql = `
//           UPDATE stockvalorant SET
//             user_name = $1,
//             name = $2,
//             rankvalo = $3,
//             cost_price = $4,
//             selling_price = $5,
//             profit_price = $6,
//             link_user = $7,
//             description = $8,
//             status = $9,
//             purchase_date = $10,
//             sell_date = $11,
//             imageurl = $12
//           WHERE id = $13
//         `;
//         params = [
//             user_name, name, rankvalo,
//             Number(cost_price), Number(selling_price), Number(profit_price),
//             link_user, description, status,
//             purchaseDateValue, sellDateValue,
//             imageUrl,
//             id
//         ];
//     } else {
//         sql = `
//           UPDATE stockvalorant SET
//             user_name = $1,
//             name = $2,
//             rankvalo = $3,
//             cost_price = $4,
//             selling_price = $5,
//             profit_price = $6,
//             link_user = $7,
//             description = $8,
//             status = $9,
//             purchase_date = $10,
//             sell_date = $11
//           WHERE id = $12
//         `;
//         params = [
//             user_name, name, rankvalo,
//             Number(cost_price), Number(selling_price), Number(profit_price),
//             link_user, description, status,
//             purchaseDateValue, sellDateValue,
//             id
//         ];
//     }

//     pool.query(sql, params, (err, result) => {
//         if (err) {
//             console.error('❌ Update DB error:', err);
//             return res.status(500).send({
//                 error: 'Failed to update data',
//                 message: err.message,
//                 detail: err.detail,
//                 hint: err.hint
//             });
//         }
//         res.send({ success: true });
//     });

// });




{/**************************************************   Delete   *************************************************/ }

app.delete('/admin_Npass_non0625232145/deleteid/:id', (req, res) => {
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
