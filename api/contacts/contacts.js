const fs = require('fs');
const path = require('path');

const contactsPath = path.join(__dirname, './db/contacts.json')
const contactList = fs.readFileSync(contactsPath, 'utf-8');
const contacts = JSON.parse(contactList);


function listContacts() {
  return contacts;
}


function getContactById(contactId) {
    return contacts.find(contact => contactId && contact.id === contactId)
}   

function removeContact(contactId) {
  const idxOfContact =  getContactById(contactId)
    if (!idxOfContact) {
        return false
    }
 
    const newContact = contacts.filter(contact => contact.id !== contactId);

    fs.writeFile(contactsPath, JSON.stringify(newContact), error => {
      if (error) {
        return console.log(error);
      }
    });
    return newContact;
}

function addContact(name, email, phone) {

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

function updateContact(contactId, dataUpdate) {
  const contactInContacts = getContactById(contactId)
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
