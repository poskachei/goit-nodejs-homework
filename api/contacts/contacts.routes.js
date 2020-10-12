const { Router } = require('express');
const ContactController = require('./contacts.controller');

const contactRouter = Router();

contactRouter.get("/contacts", ContactController.getContacts);
contactRouter.get("/contacts/:contactId", ContactController.getContactById)

contactRouter.post(
  "/contacts",
  ContactController.validateCreateContact,
  ContactController.createContact,
);

contactRouter.patch(
  "/contacts/:contactId",
  ContactController.validateContactUpdate,
  ContactController.updateContact,
);

contactRouter.delete("/contacts/:contactId", ContactController.deleteContact);

module.exports = contactRouter;
