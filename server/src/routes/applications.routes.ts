import express from "express";
import { 
    listApplications, 
    createApplication,  
    getApplication,
    editApplication,
    removeApplication
} from "../controllers/applications.controller";
import { protect } from "../middleware/auth.middleware";

const applicationRouter = express.Router();

// All application routes require a logged-in user
applicationRouter.use(protect);

applicationRouter.get("/", listApplications);
applicationRouter.post("/", createApplication);
applicationRouter.get("/:id", getApplication);
applicationRouter.patch("/:id", editApplication);
applicationRouter.delete("/:id", removeApplication);

export default applicationRouter;