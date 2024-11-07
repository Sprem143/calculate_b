const express = require('express');
const {uploaddata, downloadExcel,getsheet,calculate}= require('./controller');

const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload',upload.single('file'), uploaddata)
router.get('/download-excel', downloadExcel)
router.get('/getsheet',getsheet)
router.get('/calculate',calculate)

module.exports = router;