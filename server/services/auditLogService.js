const AuditLog = require('../models/AuditLog');

class AuditLogService {
  async createLog(data) {
    const userId = data.userId || data.user;
    const metadata = data.metadata || data.details || {};
    const log = await AuditLog.create({
      ...data,
      userId,
      user: userId,
      metadata,
      details: metadata,
    });
    return log;
  }

  async getLogs(query = {}) {
    return await AuditLog.find(query)
      .populate('userId', 'name email role')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
  }

  async getLogsForEntity(entity, entityId) {
    return await AuditLog.find({ entity, entityId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
  }
}

module.exports = new AuditLogService();
