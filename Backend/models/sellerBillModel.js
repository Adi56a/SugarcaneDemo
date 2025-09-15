const mongoose  = require('mongoose')

const SellerBillSchema  = new mongoose.Schema({

  seller_id:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Seller",
    required:true,
  }],
  
  seller_name: {
    type:String,
    required:true
  },
  seller_number:{
    type:String,
    required:true
  },
  driver_name:{
    type:String,
    required:true
  },
  sugarcane_quality:{
    type:String,
    required:true
  },
  vehicle_type:{
    type:String,
    required:true
  },
  cutter:{
    type:String,
    required:true
  },
  filled_vehicle_weight:{
    type:Number,
    required:true
  },
  empty_vehicle_weight:{
    type:Number,
    required:true
  },
  binding_material:{
    type:Number,
    required:true
  },
  only_sugarcane_weight:{
    type:Number,
    required:true
  },
  sugarcane_rate:{
    type:Number,
    required:true
  },
  taken_money :{
    type:Number,
    required:true
  },
  remaining_money:{
    type:Number,
    required:true
  },
  payment_type:{
    type:String,
    required:true
  },
  totalBill:{
    type:Number,
    require:true
  }
  },
{timestamps:true});

module.exports = mongoose.model('SellerBill',SellerBillSchema)