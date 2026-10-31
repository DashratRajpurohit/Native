const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    require:true,
    trim: true
  },

  email: {
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim: true
  },
  password: {
    type:String,
    required:true,
    minlength:6
  },
  age:{
    type:Number,
    min:1
  },
  
});

const 