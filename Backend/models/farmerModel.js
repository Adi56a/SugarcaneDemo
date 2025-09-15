const mongoose  = require('mongoose')

const farmerSchema  = new mongoose.Schema({
    farmer_name:{
        type:String,
        required:true,
        trim:true
    },
    farmer_number:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    farmer_billhistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'Bill'
    }]
},{timestamps:true});


module.exports = mongoose.model('Farmer',farmerSchema)