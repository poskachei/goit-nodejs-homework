const { Router } = require('express');

const ContactsController = require("./contacts.controller");

const contactsRouter = Router();

contactsRouter.get("/contacts", ContactsController.getContacts);
contactsRouter.get("/contacts/:contactId", ContactsController.getContactById)
contactsRouter.post("/contacts",ContactsController.validateCreateContact,ContactsController.createContact,);
contactsRouter.patch("/contacts/:contactId",ContactsController.validateContactUpdate,ContactsController.updateContact,);
contactsRouter.delete("/contacts/:contactId", ContactsController.deleteContact);

module.exports = contactsRouter; 