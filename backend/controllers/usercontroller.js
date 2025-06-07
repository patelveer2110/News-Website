import UserModel from "../models/user.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import e from "express";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
    try {
        console.log("User Register Request");
        const { username, email, password } = req.body;
        const image = req.file.path;
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const profileImage = await cloudinary.uploader.upload(image, {
            folder: "blog",
            use_filename: true,
        });
        const profileImageUrl = profileImage.secure_url;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ username, email, password: hashedPassword, profileImage: profileImageUrl });   
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(201).json({ message: "User registered successfully", token });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

const loginUser = async (req, res) => {
    console.log("User Login Request");
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User Not Found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }       
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ message: "User logged in successfully", token });    
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}




export { registerUser, loginUser };