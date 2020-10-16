const { promises: fsPromises } = require('fs')
const fs = require('fs');
const path = require('path');

const contactsPath = path.join(__dirname, './db/contacts.json');


async function listContacts() {
  const contactList = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(contactList);
  return contacts;
}

async function getContactById(contactId) {
  const contacts = await listContacts;
  return contacts.find(contact => contactId && contact.id === contactId)
}   

async function removeContact(contactId) {

  const idxOfContact = await getContactById(contactId)
  if (!idxOfContact) {
    return false
  }

  const contacts = await listContacts;
  const newContact = contacts.filter(contact => contact.id !== contactId);

  fs.writeFile(contactsPath, JSON.stringify(newContact), error => {
    if (error) {
      return console.log(error);
    }
  });
  return newContact;
}

async function addContact(name, email, phone) {
  const contacts = await listContacts;
    contacts.push({
      id: contacts.length + 1,
      name: name,
      email: email,
      phone: phone,
    });

    fs.writeFile(contactsPath, JSON.stringify(contacts), error => {
      if (error) {
        return console.log(error);
      }
    });
    return contacts;
}

async function updateContact(contactId, dataUpdate) {
  const contactInContacts = await getContactById(contactId)
  if (!contactInContacts) {
    return false
  }
  const data = listContacts()
  let updated
  data.forEach((el, idx) => {
      if (el.id === contactId) {
          data[idx] = { id: el.id, ...dataUpdate }
          updated = data
      }
  });
  fs.writeFile(contactsPath, JSON.stringify(contacts), error => {
    if (error) {
      return console.log(error);
    }
  });
  return updated
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact
};
