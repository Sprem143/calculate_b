const mongoose = require('mongoose');

const db = () => {
    mongoose.connect('mongodb+srv://prem:prem2024@cluster0.seo2o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
        });
};

module.exports = db;
