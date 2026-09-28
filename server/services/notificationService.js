const Notification = require('../models/Notification');

class NotificationService {
  async createNotification(data) {
    const userId = data.userId || data.recipient;
    const notification = await Notification.create({
      ...data,
      userId,
      recipient: userId,
      isRead: data.isRead || false,
      read: data.isRead || false,
    });
    return notification;
  }

  async getUserNotifications(userId) {
    return await Notification.find({
      $or: [{ userId }, { recipient: userId }],
    }).sort({ createdAt: -1 });
  }

  async markAsRead(id, userId) {
    return await Notification.findOneAndUpdate(
      { _id: id, $or: [{ userId }, { recipient: userId }] },
      { isRead: true, read: true },
      { new: true }
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { $or: [{ userId }, { recipient: userId }], isRead: false },
      { isRead: true, read: true }
    );
  }
}

const sendNotification = async ({ recipient, title, message, type = 'SYSTEM', link = '' }) => {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      userId: recipient,
      title,
      message,
      type,
      link,
      read: false,
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error('[Notification Service Error]:', error.message);
    return null;
  }
};

const serviceInstance = new NotificationService();
serviceInstance.sendNotification = sendNotification;

module.exports = serviceInstance;
