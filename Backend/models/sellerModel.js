const mongoose  = require('mongoose')

const sellerSchema  = new mongoose.Schema({
    seller_name:{
        type:String,
        required:true,
        trim:true
    },
    seller_number:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    seller_billhistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'SellerBill'
    }]
},{timestamps:true});


module.exports = mongoose.model('Seller',sellerSchema)