const express = require('express')
const router  = express.Router()
const {createBill , deleteBill} = require('../controllers/billController')
const verifyAdmin = require('../middlewares/authMiddleware')



router.post('/create', verifyAdmin , createBill)
router.delete('/delete/:billId', deleteBill);



module.exports = router;