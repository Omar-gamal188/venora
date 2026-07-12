import { Router } from "express";
import { health, live, ready } from "../controllers/healthController.js";

export const healthRouter = Router();

healthRouter.get("/health", health); // legacy
healthRouter.get("/health/live", live); // liveness probe
healthRouter.get("/health/ready", ready); // readiness probe
