import app from "./app";
import connectDatabase from "./db/database";
import dotenv from "dotenv";
// Config the dotenv file
dotenv.config({ path: "./src/config/.env" });

// Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`shutting down the server for handling uncaught exception`);
});

console.log(process.env.PORT)
// config
if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({
    path: "./src/config/.env",
  });
}

// connect db
connectDatabase();

// Create server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

// Unhandled promise rejection
process.on("uncaughtException", (err) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`shutting down the server for unhandle promise rejection`);

    server.close(() => {
        process.exit(1);
    });
});