import mongoose from "mongoose";

const connectDatabase = async (): Promise<void> => {
  // use when starting application locally
  const mongoUrlLocal: any = process.env.MONGO_URL;

  // use when starting application as docker container
  const mongoUrlDocker: string = "mongodb://mongodb-container-flone:2717";

  try {
    // Establish connection to the database
    const connection = await mongoose.connect(mongoUrlLocal);
    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error: any) {
    console.error(`Error ${error.message}`);
    process.exit(1);
  }
};

export default connectDatabase;
