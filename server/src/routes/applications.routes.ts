import express from "express";
import { 
    listApplications, 
    getApplication,
    createApplication,  
    editApplication,
    moveApplication,
    removeApplication
} from "../controllers/applications.controller";
import { protect } from "../middleware/auth.middleware";

const applicationRouter = express.Router();

// All application routes require a logged-in user
applicationRouter.use(protect);

applicationRouter.get("/", listApplications);
applicationRouter.get("/:id", getApplication);
applicationRouter.post("/", createApplication);
applicationRouter.patch("/:id", editApplication);
applicationRouter.delete("/:id", removeApplication);

// endpoint for drag-and-drop Kanban movement
applicationRouter.patch("/:id/move", moveApplication);

export default applicationRouter;