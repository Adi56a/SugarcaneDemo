const mongoose  = require('mongoose')

const billSchema  = new mongoose.Schema({

  farmer_id:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Farmer",
    required:true,
  }],
  
  farmer_name: {
    type:String,
    required:true
  },
  farmer_number:{
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
  given_money :{
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

module.exports = mongoose.model('Bill',billSchema)