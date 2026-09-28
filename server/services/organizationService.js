const Organization = require('../models/Organization');

class OrganizationService {
  async createOrganization(data, userId) {
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const org = await Organization.create({
      ...data,
      createdBy: userId,
      owner: userId,
    });
    return org;
  }

  async getAllOrganizations(query = {}) {
    return await Organization.find(query)
      .populate('createdBy', 'name email')
      .populate('owner', 'name email');
  }

  async getOrganizationById(id) {
    return await Organization.findById(id)
      .populate('createdBy', 'name email')
      .populate('owner', 'name email');
  }

  async updateOrganization(id, data) {
    if (data.name && !data.slug) {
      data.slug = data.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    return await Organization.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteOrganization(id) {
    return await Organization.findByIdAndDelete(id);
  }
}

module.exports = new OrganizationService();
