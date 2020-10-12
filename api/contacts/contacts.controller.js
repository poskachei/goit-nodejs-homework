const Joi = require('joi');

const contacts = require("./contacts");

class ContactController {
  getContacts(req, res, next) {
    try {
      const contactsList = contacts.listContacts();
      return res.send(contactsList);
    } catch (err) {
      next(err);
    }
  }

  getContactById(req, res, next) {
    try{
      const contactId = Number.parseInt(req.params.contactId)
      const contact = contacts.getContactById(contactId)
      return contact ? res.send(contact) : res.status(404).send({ message: "Not found" })
    } catch (err) {
      next(err);
    }

  }

  createContact(req, res, next) {
    try {
      const { name, email, phone } = req.body;
      contacts.addContact(name, email, phone);
      
      return res.status(201).send({ "message": "Contact created" })
    } catch (err) {
      next(err);
    }
  }

  updateContact(req, res, next) {
    try {
      const id = Number.parseInt(req.params.contactId)
      const contactToUpdate =  contacts.updateContact(id, req.body)
      return contactToUpdate ?
          res.status(200).send({ "message": "contact updated" }) :
          res.status(404).send({ "message": "Not found" })

  } catch (err) {
      next(err)
  }
  }

  deleteContact(req, res, next) {
    try {
      const contactId = Number.parseInt(req.params.contactId)
      const targetContactsIndex = contacts.removeContact(contactId);

      return targetContactsIndex ?
          res.status(200).send({ "message": "contact deleted" }) :
          res.status(404).send({ "message": 'Not found' })

    } catch (err) {
      next(err);
    }
  }

  validateContactUpdate(req, res, next) {
    const updateSchemaValidator = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
    });

    ContactController.checkValidationError(
      updateSchemaValidator,
      req,
      res,
      next,
    );
  }

  validateCreateContact(req, res, next) {
    const createSchemaValidator = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
    });

    ContactController.checkValidationError(
      createSchemaValidator,
      req,
      res,
      next,
    );
  }

  static checkValidationError(schema, req, res, next) {
    const { error } = schema.validate(req.body);

    if (error) {
      const { message } = error.details[0];
      return res.status(400).send({ error: message });
    }
    next();
  }

  static findContactIndexById(contactId, res) {
    const id = parseInt(contactId);
    const targetContactsIndex = contacts.findIndex(
      contact => contact.contactId === id,
    );

    if (targetContactsIndex === -1) {
      return res.status(404).send({ message: 'Not found' });
    }

    return targetContactsIndex;
  }
}

module.exports = new ContactController();
