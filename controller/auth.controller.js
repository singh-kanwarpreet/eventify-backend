const userModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const organizerModel = require("../models/Organizer");

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      role,
      organizationName,
      description,
    } = req.body;

    const isExists = await userModel.findOne({ $or: [{ phone }, { email }] });
    if (isExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const orgExists = await organizerModel.findOne({ organizationName });
    if (orgExists) {
      return res.status(400).json({ message: "Organization name already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const saveProfile = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      dateOfBirth,
      role: role || "USER",
    });

    if (role === "ORGANIZER") {
      await organizerModel.create({
        organizationName,
        description,
        managedBy: saveProfile._id,
      });
    }

    const tokenPayload = {
      _id: saveProfile._id,
      role: saveProfile.role,
      name: saveProfile.name,
      email: saveProfile.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: {
        id: saveProfile._id,
        role: saveProfile.role,
        email: saveProfile.email,
        name: saveProfile.name,
      },
      message: `${role === "ORGANIZER" ? "Organizer" : "User"} created successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userProfile = await userModel.findOne({ email });
    if (!userProfile) {
      return res.status(401).json({ message: "Email or Password is wrong" });
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      userProfile.password,
    );
    if (!isPasswordMatched) {
      return res.status(401).json({ message: "Email or Password is wrong" });
    }

    const tokenPayload = {
      _id: userProfile._id,
      role: userProfile.role,
      name: userProfile.name,
      email: userProfile.email,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      user: {
        id: userProfile._id,
        role: userProfile.role,
        email: userProfile.email,
        name: userProfile.name,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const rememberMe = async (req, res) => {
  const user = req.user;
  res.status(200).json({
    user: {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
  });
};

module.exports = { signup, login, logOut, rememberMe };
