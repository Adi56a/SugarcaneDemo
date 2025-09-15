const express = require('express')
const router  = express.Router()
const { registerSeller  , fetchAllSellers , fetchSellerById , updateSellerById} = require('../controllers/sellerController')


router.post('/register' , registerSeller)
router.get('/all', fetchAllSellers)
router.get('/:selectedSellerId', fetchSellerById);
router.put('/update/:sellerId', updateSellerById);





module.exports = router;