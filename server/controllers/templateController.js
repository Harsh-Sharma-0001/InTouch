import Template from '../models/Template.js';
import AuditLog from '../models/AuditLog.js';

export const getAllTemplates = async (req, res) => {
  // Require admin access for template management
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  try {
    const templates = await Template.find().populate('createdBy', 'name email');
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch templates', error: err.message });
  }
};

export const getTemplateById = async (req, res) => {
  // Require admin access for template management
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  try {
    const template = await Template.findById(req.params.id).populate('createdBy', 'name email');
    if (!template) return res.status(404).json({ message: 'Template not found' });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch template', error: err.message });
  }
};

export const createTemplate = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, description, questions } = req.body;
    const template = await Template.create({
      name,
      description,
      questions,
      createdBy: req.user.id
    });
    // Audit log
    await AuditLog.create({
      action: 'create',
      admin: req.user.email,
      target: name,
      details: `Created template '${name}'`
    });
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create template', error: err.message });
  }
};

export const updateTemplate = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, description, questions } = req.body;
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { name, description, questions },
      { new: true, runValidators: true }
    );
    if (!template) return res.status(404).json({ message: 'Template not found' });
    // Audit log
    await AuditLog.create({
      action: 'update',
      admin: req.user.email,
      target: name,
      details: `Updated template '${name}'`
    });
    res.json(template);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update template', error: err.message });
  }
};

export const deleteTemplate = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ message: 'Template not found' });
    // Audit log
    await AuditLog.create({
      action: 'delete',
      admin: req.user.email,
      target: template.name,
      details: `Deleted template '${template.name}'`
    });
    res.json({ message: 'Template deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete template', error: err.message });
  }
};

export const getTemplateAuditLogs = async (req, res) => {
  if (!req.user || !req.user.isAdmin) return res.status(403).json({ message: 'Forbidden' });
  try {
    const logs = await AuditLog.find({ target: { $exists: true, $ne: null } , details: /template/ }).sort({ time: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch template audit logs', error: err.message });
  }
}; 