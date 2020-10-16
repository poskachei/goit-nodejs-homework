const Joi = require("joi");

const ContactsModel = require("./contacts.model");

class ContactsController {
    async getContacts(req, res, next) {
      try {
          const contactsList = await ContactsModel.find();
          return res.send(contactsList);
      } catch (err) {
        next(err);
      }
    }
  
    async getContactById(req, res, next) {
      try {
          const contact = await ContactsModel.findById(req.params.contactId);
          return contact ? res.status(200).send(contact) : res.status(404).send({ message: "Not found" });
      } catch (err) {
          next(err);
      } 
    }
  
    async createContact(req, res, next) {
      try {
          const newContact = await ContactsModel.create(req.body);
          return res.status(201).send(newContact);
      } catch (err) {
          next(err);
      }
    }
  
    async updateContact(req, res, next) {
      try {         
          const contactToUpdate = await ContactsModel.findByIdAndUpdate(req.params.contactId, req.body)
          return contactToUpdate ?
              res.status(200).send({ "message": "contact updated" }) :
              res.status(404).send({ "message": "Not found" })               
      } catch (err) {
          next(err)
      }
    }
  
    async deleteContact(req, res, next) {
      try {
          const contactDelete = await ContactsModel.findByIdAndDelete(req.params.contactId);
          return contactDelete ?
              res.status(200).send({ "message": "contact deleted" }) :
              res.status(404).send({ "message": 'Not found' })
      } catch (err) {
          next(err);
      }
    }
  
    validateCreateContact(req, res, next) {
        const createSchemaValidator = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().required(),
            phone: Joi.string().required(),
            subscription: Joi.string().required(),
            password: Joi.string().required()
        });  
        ContactsController.checkValidationError(createSchemaValidator, req, res, next);
    }

    validateContactUpdate(req, res, next) {
        const updateSchemaValidator = Joi.object({
            name: Joi.string(),
            email: Joi.string(),
            phone: Joi.string(),
            subscription: Joi.string(),
            password: Joi.string(),
            token: Joi.string()
        }); 
        ContactsController.checkValidationError(updateSchemaValidator, req, res, next);
    }
  
    static checkValidationError(schema, req, res, next) {
        const { error } = schema.validate(req.body);
  
        if (error) {
            const { message } = error.details[0];
            return res.status(400).send({ error: message });
        }
        next();
    }
  }
  
  module.exports = new ContactsController();
  