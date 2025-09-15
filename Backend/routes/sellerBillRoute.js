const express = require('express')
const router  = express.Router()


const {createSellerBill , deleteBill} = require('../controllers/sellerBillController') 


router.post('/create-bill',createSellerBill )
router.delete('/delete/:billId', deleteBill);

module.exports = router;

