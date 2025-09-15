const Farmer = require('../models/farmerModel');
const router = require('../routes/farmerRoute');
const mongoose = require('mongoose')
const Bill  = require('../models/billModel')

const registerFarmer = async (req,res) => {
    
    try{
        const {farmer_name , farmer_number} = req.body;

        if(!farmer_name || !farmer_number){
            return res.status(400).json({message:"Farmer name and number both are required"})
        }
          
        const existingFarmer = await Farmer.findOne({farmer_number});
        if(existingFarmer){
            return res.status(400).json({message:"Farmer with this number already exist"})
        }

        const newFarmer = new Farmer({
            farmer_name,
            farmer_number
        })

        const savedFarmer  = await newFarmer.save();

        res.status(201).json({
            message:"Farmer registered successfully",
            farmer : savedFarmer
        });

    }catch(error){
        console.error('Error registering Farmer',error);
        res.status(500).json({message:"Server Error , Could not register farmer"})
    }
};


const fetchFarmerName = async (req,res) => {
    const {farmer_number}  = req.params;
    try {
        const farmer  = await Farmer.findOne({farmer_number});

        if(!farmer){
            return res.status(404).json({message:"Farmer not found"})

        }
        return res.status(200).json({
            name : farmer.farmer_name,
        })
    } catch (error) {
       return res.status(500).json({message:"Internal Sersver Error"})   
    }
}

const fetchAllFarmer = async (req, res) => {
  try {
    // Fetch all farmers from the database
    const farmers = await Farmer.find();  // This returns all documents in the 'farmers' collection

    // Check if there are no farmers in the database
    if (farmers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No farmers found',
      });
    }

    // Return the farmers data with a success message
    return res.status(200).json({
      success: true,
      data: farmers,
    });
  } catch (error) {
    // Catch any errors and return an error response
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the farmers',
    });
  }
};


const fetchFarmerById = async (req, res) => {
  const { selectedFarmerId } = req.params; // Get the selected farmer ID from the URL parameters

  // Validate if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(selectedFarmerId)) {
    return res.status(400).json({ message: "Invalid Farmer ID" });
  }

  try {
    // Find the farmer by their ID and populate the `farmer_billhistory` field (bills)
    const farmer = await Farmer.findById(selectedFarmerId).populate('farmer_billhistory');

    // If no farmer is found, return a 404 error
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Return the farmer details along with the populated bills array
    return res.status(200).json({
      success: true,
      farmer: {
        name: farmer.farmer_name,
        farmer_number: farmer.farmer_number,
        bills: farmer.farmer_billhistory, // Populated bills
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const updateFarmerById = async (req, res) => {
  const { farmerId } = req.params; // Changed from 'id' to 'farmerId'
  const { farmer_number, farmer_name } = req.body;

  try {
    let farmer = await Farmer.findById(farmerId); // Changed from 'id' to 'farmerId'
     
    if (!farmer) {
      return res.status(404).json({ 
        success: false,
        message: "Farmer not found" 
      });
    }

    if (farmer_number) farmer.farmer_number = farmer_number;
    if (farmer_name) farmer.farmer_name = farmer_name;

    await farmer.save();

    return res.status(200).json({
      success: true,
      message: "Farmer Details Updated Successfully",
      farmer: farmer
    });

  } catch (error) { // Fixed typo: 'e' to 'error'
    return res.status(500).json({ 
      success: false,
      message: "Error updating farmer", 
      error: error.message 
    });
  }
};



const deleteFarmer = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Check if farmer exists
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Delete all bills associated with this farmer
    const deleteBillsResult = await Bill.deleteMany({
      _id: { $in: farmer.farmer_billhistory }
    });

    // Delete the farmer
    await Farmer.findByIdAndDelete(farmerId);

    return res.status(200).json({
      success: true,
      message: 'Farmer and all associated bills deleted successfully',
      data: {
        deletedFarmer: farmer.farmer_name,
        deletedBillsCount: deleteBillsResult.deletedCount
      }
    });

  } catch (error) {
    console.error('Delete farmer error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the farmer'
    });
  }
};




module.exports = {registerFarmer , deleteFarmer, fetchFarmerName , fetchAllFarmer , fetchFarmerById , updateFarmerById} 