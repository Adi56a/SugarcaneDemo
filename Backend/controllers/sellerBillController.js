const Seller  = require('../models/sellerModel');
const SellerBill = require('../models/sellerBillModel')

const createSellerBill = async (req,res) => {

    try {
        const {
               seller_number, // This is the seller's mobile number, which will be used to find the seller
            driver_name,
            sugarcane_quality,
            vehicle_type,
            cutter,
            filled_vehicle_weight,
            empty_vehicle_weight,
            binding_material,
            only_sugarcane_weight,
            sugarcane_rate,
            taken_money,
            remaining_money,
            payment_type,
            totalBill
        }  = req.body;


        const seller  = await Seller.findOne({seller_number});

        if(!seller){
            return res.status(404).json({
                message:"seller Not found with this number"
            })
        }

        const newSellerBill  = new SellerBill({
            seller_id: seller._id,  // The seller's _id from the Seller model
            seller_name: seller.seller_name,
            seller_number: seller.seller_number,
            driver_name,
            sugarcane_quality,
            vehicle_type,
            cutter,
            filled_vehicle_weight,
            empty_vehicle_weight,
            binding_material,
            only_sugarcane_weight,
            sugarcane_rate,
            taken_money,
            remaining_money,
            payment_type,
            totalBill
        })


        const savedSellerBill = await newSellerBill.save();

        seller.seller_billhistory.push(savedSellerBill._id);
        await seller.save();

        return res.status(201).json({
            message:"seller bill created successfully ",
            sellerBill : savedSellerBill
        });



    } catch (error) {

        console.error(error);
        return res.status(500).json({
            message:"Server Error , Please Try again later ",
            error:error.message
        });
        
    }

};



const deleteBill = async (req, res) => {
  const { billId } = req.params; // Extract the billId from the URL parameters
  try {
    // Step 1: Find the bill by its ID
    const bill = await SellerBill.findById(billId);
    if (!bill) {
      return res.status(404).json({
        message: 'Bill not found with this ID',
      });
    }

    // Step 2: Find the seller associated with the bill
    const seller = await Seller.findById(bill.seller_id); // Adjust the field to seller_id
    if (!seller) {
      return res.status(404).json({
        message: 'Seller not found for this bill',
      });
    }

    // Step 3: Remove the bill from the seller's bill history
    seller.seller_billhistory = seller.seller_billhistory.filter(
      (historyId) => historyId.toString() !== billId.toString()  // Compare correctly as strings
    );

    await seller.save(); // Save the updated seller record

    // Step 4: Delete the bill from the Bill collection
    await SellerBill.findByIdAndDelete(billId);  // Delete the bill from the database

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
    createSellerBill,
    deleteBill
}