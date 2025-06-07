import AdminModel from "../models/admin.js";
import jwt from "jsonwebtoken";


export const adminAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await AdminModel.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("Admin authenticated:", admin._id);
        
        req.adminID = admin._id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}