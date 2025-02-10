const express = require('express');
const brand_names = require('./TW_Master_json');
const fourW_brand_names = require('./4W_Master_json');
const router = express.Router();

router.get('/tw-brands', (req,res)=>{
    res.json(brand_names)
});

// router.get('/fw-brands', (req,res)=>{
//     res.json(fourW_brand_names)
// })


module.exports = router;
