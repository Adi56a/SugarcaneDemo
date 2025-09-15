const Seller  = require('../models/sellerModel');

const registerSeller = async(req,res) => {

    const {seller_name , seller_number} = req.body ; 

    if(!seller_name || !seller_number){
        return res.status(400).json({message:"Seller name and number is required"})
    }

    try {
        const existingSeller  = await Seller.findOne({seller_number});
        if(existingSeller){
            return res.status(400).json({message:"seller with this number already"});

        }

        const newSeller = new Seller({
            seller_name,
            seller_number
        })
       
        await newSeller.save();


        return res.status(201).json({message:"Seller registered Successfully",seller:newSeller});


    } catch (error) {
        console.error(error)
        return res.status(500).json({message:"Server Error , Please Try again later"})
    }
};


const fetchAllSellers = async (req, res) => {
  try {
    // Fetch all sellers from the database
    const sellers = await Seller.find();  // This returns all documents in the 'sellers' collection

    // Check if there are no sellers in the database
    if (sellers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sellers found',
      });
    }

    // Return the sellers data with a success message
    return res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    // Catch any errors and return an error response
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching the sellers',
    });
  }
};

const fetchSellerById = async (req, res) => {
  const { selectedSellerId } = req.params; // Get the selected seller ID from the URL parameters

  // Validate if the provided ID is a valid MongoDB ObjectId
 

  try {
    // Find the seller by their ID and populate the `seller_billhistory` field (bills)
    const seller = await Seller.findById(selectedSellerId).populate('seller_billhistory');

    // If no seller is found, return a 404 error
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Return the seller details along with the populated bills array
    return res.status(200).json({
      success: true,
      seller: {
        name: seller.seller_name,
        seller_number: seller.seller_number,
        bills: seller.seller_billhistory, // Populated bills
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



const updateSellerById = async (req, res) => {
  const { sellerId } = req.params; // Changed from 'farmerId' to 'sellerId'
  const { seller_number, seller_name } = req.body; // Update fields for seller

  try {
    let seller = await Seller.findById(sellerId); // Changed from 'Farmer' to 'Seller'
    
    if (!seller) {
      return res.status(404).json({ 
        success: false,
        message: "Seller not found" 
      });
    }

    if (seller_number) seller.seller_number = seller_number;
    if (seller_name) seller.seller_name = seller_name;

    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Seller Details Updated Successfully",
      seller: seller
    });

  } catch (error) { 
    return res.status(500).json({ 
      success: false,
      message: "Error updating seller", 
      error: error.message 
    });
  }
};

module.exports = {registerSeller , fetchAllSellers , fetchSellerById , updateSellerById}