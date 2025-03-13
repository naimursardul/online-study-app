/*
 * Title: Database config
 * Description: MongoDB config
 * Author: Naimur Rahman
 * Date: 2024-10-26
 *
 */

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connection = {};

// CONNECT DB
const ConnectDB = async () => {
  try {
    if (connection.isConnected) {
      console.log(`[DB]: Using existing connection!`);
      return;
    }
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB]: Database connected successfully!`);

    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.log(`[DB ERROR]: ${error}`);
  }
};

export default ConnectDB;
