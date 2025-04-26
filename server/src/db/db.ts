import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

interface ConnectionStatus {
  isConnected?: number;
}

const connection: ConnectionStatus = {};

// CONNECT DB
const ConnectDB = async (): Promise<void> => {
  try {
    if (connection.isConnected) {
      console.log(`[DB]: Using existing connection!`);
      return;
    }

    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables.');
    }

    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB]: Database connected successfully!`);

    connection.isConnected = db.connections[0].readyState;
  } catch (error) {
    console.log(`[DB ERROR]: ${(error as Error).message}`);
  }
};

export default ConnectDB;
