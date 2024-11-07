const express = require('express');
const cors = require('cors');
const db = require('./db');
const router = require('./router');
db();


const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use('/', router);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
