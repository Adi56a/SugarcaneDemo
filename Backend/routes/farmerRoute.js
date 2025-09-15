const express = require('express')
const router  = express.Router()
const {registerFarmer , updateFarmerById, fetchAllFarmer , deleteFarmer, fetchFarmerById} = require('../controllers/farmerController')
const verifyAdmin = require('../middlewares/authMiddleware')




router.post('/register', verifyAdmin ,registerFarmer)

router.get('/all',fetchAllFarmer)
router.get('/:selectedFarmerId',fetchFarmerById)
router.put('/update/:farmerId', updateFarmerById)
router.delete('/delete/:farmerId', deleteFarmer);

module.exports = router;