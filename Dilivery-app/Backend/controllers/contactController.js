const Contact = require('../models/Contact');

// @desc    Get user contacts
// @route   GET /api/contacts
// @access  Private
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Server error fetching contacts' });
  }
};

// @desc    Create new contact
// @route   POST /api/contacts
// @access  Private
exports.createContact = async (req, res) => {
  try {
    const { name, courierCompany, phone, email, notes } = req.body;

    if (!name || !courierCompany) {
      return res.status(400).json({ success: false, message: 'Name and Courier/Company are required' });
    }

    const contact = new Contact({
      user: req.user._id,
      name,
      courierCompany,
      phone: phone || '',
      email: email || '',
      notes: notes || ''
    });

    const savedContact = await contact.save();
    res.status(201).json({ success: true, data: savedContact });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, message: 'Server error creating contact' });
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Private
exports.updateContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this contact' });
    }

    const { name, courierCompany, phone, email, notes } = req.body;
    contact.name = name || contact.name;
    contact.courierCompany = courierCompany || contact.courierCompany;
    contact.phone = phone !== undefined ? phone : contact.phone;
    contact.email = email !== undefined ? email : contact.email;
    contact.notes = notes !== undefined ? notes : contact.notes;

    const updatedContact = await contact.save();
    res.status(200).json({ success: true, data: updatedContact });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ success: false, message: 'Server error updating contact' });
  }
};

// @desc    Delete contact
// @route   DELETE /api/contacts/:id
// @access  Private
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    if (contact.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this contact' });
    }

    await contact.deleteOne();
    res.status(200).json({ success: true, message: 'Contact removed successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ success: false, message: 'Server error deleting contact' });
  }
};
