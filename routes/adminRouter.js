//Kunden Acounts erstellen -> signup (post)
//Kunden Accounts löschen - Aktualisieren
//Sich einlogen können
//Alle Tickets von allen Kunden sehen können
//Alle Tickets vcon allen Kunden uipdaten können
import { logIn } from "../controllers/logInOutController.js";
import { Router } from "express";
import {
  getTicketsFromAllUsers,
  getCompanyInfos,
  getCompanyTickets,
  createNewUser,
  updateTicket,
  getAllCompanies,
  deleteUser,
  createNewCompany,
} from "../controllers/adminController.js";

const adminRouter = Router();
adminRouter.route("/login").post(logIn); //done checked -> success
adminRouter
  .route("/ticketsprocompany")
  .post(getCompanyTickets)
  .put(updateTicket); //done Checked -> success
adminRouter.route("/tickets").post(getTicketsFromAllUsers); //done Aber muss später wenn wir mehrere Tickets haben nochmal geprüft werden
adminRouter
  .route("/companies")
  .get(getAllCompanies)
  .delete(deleteUser); //done getAllCompanies -> success - deleteuser muss change to put(updateCompanyStatus)
adminRouter.route("/users/addnewuser").post(createNewUser); //done checked -> success
adminRouter.route("/companies/addnewcompany").post(createNewCompany); // done Check -> success
adminRouter.route("/company/infos").get(getCompanyInfos);

export default adminRouter;
