const xlsx = require('xlsx');
const Product = require('./model')
const path = require('path');
const fs = require('fs')
exports.uploaddata = async (req, res) => {
  console.log("api called")
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];  // Read first sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet to JSON
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(data)
  Product.insertMany(data)
    .then(async () => {
      res.status(200).json({ msg: "File uploaded Successfully" })
    })
    .catch(err => {
      console.error('Error saving data to MongoDB:', err);
      res.status(500).json({ msg: 'Error saving data to Database' });
    });

};
// -------------------------------------------------------------

exports.downloadExcel = async (req, res) => {
  try {
    const data = await Product.find();
    if (!data || data.length === 0) {
      return res.status(404).send('No data found.');
    }

    const jsondata = data.map((item) => (
      {
        // UPC:item.UPC
        SKU: item.SKU,
        "Original Product Cost": item['Original Product Cost'],
        "Current Products Cost": item['Current Products Cost'],
        "Vendor Shipping": item['Vendor Shipping'],
        Fulfillment: item.Fulfillment,
        "Amazon Fees%": item['Amazon Fees%']*100+'%',
        "Shipping Template used": item['Shipping Template used'],
        'Min Profit $- Calculations': item['Min Profit $- Calculations'],
        'Current Inventory': item['Current Inventory'],
        'Total Cost': (item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment).toFixed(2),
        'Maximum Price': ((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment) * 1.75).toFixed(2),
        'Minimum Price':((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))).toFixed(2),
        'Amazon Fee':((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))*item['Amazon Fees%']).toFixed(2),
        'Net Profit':item['Min Profit $- Calculations'].toFixed(2),
        Min:((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))-item['Shipping Template used']).toFixed(2),
        Max:(((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment) * 1.75)-item['Shipping Template used']).toFixed(2),
        'Selling Price':((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment)*1.3).toFixed(2),
        'Selling - Min Price for Checking':(((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment)*1.3) - ((100*(item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment + item['Min Profit $- Calculations']))/(100-(100*item['Amazon Fees%']))-item['Shipping Template used'])).toFixed(2),
        'Max Price - Selling Price':((((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment) * 1.75)-item['Shipping Template used'])- ((item['Current Products Cost'] + item['Vendor Shipping'] + item.Fulfillment)*1.3)).toFixed(2),
        'Price difference with new-old':(item['Current Products Cost']-item['Original Product Cost']).toFixed(2)
      }
    ))
    const worksheet = xlsx.utils.json_to_sheet(jsondata);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");
    const filePath = path.join(__dirname, 'data.xlsx');
    xlsx.writeFile(workbook, filePath);

    // Send the Excel file for download
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    console.log(err)
  }
}