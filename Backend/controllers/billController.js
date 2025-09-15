const Bill  = require('../models/billModel')
const Farmer  = require('../models/farmerModel')


const createBill  = async (req,res) => {
    try {
        
        const {
      farmer_number, // This is the farmer's mobile number, which will be used to find the farmer
      farmer_name,
      driver_name,
      sugarcane_quality,
      vehicle_type,
      cutter,
      filled_vehicle_weight,
      empty_vehicle_weight,
      binding_material,
      only_sugarcane_weight,
      sugarcane_rate,
      given_money,
      remaining_money,
      payment_type,
      totalBill
    } = req.body;

    const farmer  = await Farmer.findOne({farmer_number});

    if(!farmer){
        return res.status(404).json({
            message:"Farmer Not found with This number"
        });
    }

        const newBill = new Bill({
      farmer_id: farmer._id,  // The farmer's _id from the Farmer model
      farmer_name:farmer.farmer_name,
      farmer_number:farmer.farmer_number,
      driver_name,
      sugarcane_quality,
      vehicle_type,
      cutter,
      filled_vehicle_weight,
      empty_vehicle_weight,
      binding_material,
      only_sugarcane_weight,
      sugarcane_rate,
      given_money,
      remaining_money,
      payment_type,
      totalBill
    });

    const savedBill = await newBill.save();

    await farmer.farmer_billhistory.push(savedBill._id);
    await farmer.save();


    res.status(201).json({
        message:"Bill Created Successfully and Liked to the Farmer",
        bill:savedBill
    });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message:"Server error Please try again later",
            error:error.message
        })
    }
};


const deleteBill = async (req, res) => {
  const { billId } = req.params; // Extract the billId from the URL parameters
  try {
    // Step 1: Find the bill by its ID
    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({
        message: 'Bill not found with this ID',
      });
    }

    // Step 2: Find the farmer associated with the bill
    const farmer = await Farmer.findById(bill.farmer_id);
    if (!farmer) {
      return res.status(404).json({
        message: 'Farmer not found for this bill',
      });
    }

    // Step 3: Remove the bill from the farmer's bill history
    // Rename the filter parameter to avoid confusion with billId
    farmer.farmer_billhistory = farmer.farmer_billhistory.filter(
      (historyId) => historyId.toString() !== billId.toString()  // Compare correctly as strings
    );

    await farmer.save(); // Save the updated farmer record

    // Step 4: Delete the bill from the Bill collection
    await Bill.findByIdAndDelete(billId);  // Delete the bill from the database

    // Step 5: Return success response
    res.status(200).json({
      message: 'Bill deleted successfully',
    });
  } catch (error) {
    console.error("Error in deleting bill:", error);
    res.status(500).json({
      message: 'Server error. Please try again later.',
      error: error.message,
    });
  }
};


module.exports = {
    createBill,
    deleteBill
}