const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://blog:blog@blog.o2ekj5y.mongodb.net/blogg?retryWrites=true&w=majority'; // Replace with your database URL

  const connection=async()=>{
    try {
        await mongoose.connect(mongoURI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
      }
  }
  module.exports=connection