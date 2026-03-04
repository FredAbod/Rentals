import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../lib/models/User";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error(
        "MONGODB_URI is not defined in the environment variables.",
      );
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for seeding.");

    const adminEmail = "admin@cssignature.co.uk";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin user ${adminEmail} already exists. Skipping seed.`);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = new User({
      email: adminEmail,
      password: hashedPassword,
      name: "System Admin",
      role: "admin",
    });

    await admin.save();
    console.log(`Admin user ${adminEmail} seeded successfully!`);
    console.log(`Default password is: admin123`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
