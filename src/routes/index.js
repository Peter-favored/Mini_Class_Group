import express from "express";

import authRoutes from "./authRoutes.js";
import noticesRoutes from "./noticesRoutes.js";
import assignmentRoutes from "./assignmentRoutes.js";
import submissionRoutes from "./submissionsRoutes.js";
import timetableRoutes from "./timetableRoutes.js";
import studentsRoutes from "./studentsRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/notices", noticesRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/submissions", submissionRoutes);
router.use("/timetables", timetableRoutes);
router.use("/students", studentsRoutes);

export default router;