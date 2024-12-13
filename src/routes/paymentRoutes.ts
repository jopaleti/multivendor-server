import express from "express";

import initialiseTransaction from "../controller/payment";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

router.post("/initialise-transaction", initialiseTransaction);

export default router;