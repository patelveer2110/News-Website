import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: "https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp",
  },
  followers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },

}, { timestamps: true }); 

const AdminModel = mongoose.model.Admin || mongoose.model('Admin', adminSchema);


export default AdminModel;