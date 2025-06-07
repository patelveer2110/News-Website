import UserModel from '../models/user.js';
import jwt from 'jsonwebtoken';

export const userAuth = async (req, res, next) => {
    try {

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("Token received for user authentication:", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.id);
        if (!user) {
            
            return res.status(401).json({ message: "Unauthorized" });
        }
        console.log("User authenticated:", user.username);
        
        req.userID = user._id;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
}