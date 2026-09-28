const Notification = require('../models/Notification');
const { ApiResponse, ApiError } = require('../utils/response');

const buildOwnerFilter = (userId) => ({
  $or: [{ recipient: userId }, { userId }],
});

const getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 50);
    const skip = (safePage - 1) * safeLimit;
    const userId = req.user._id || req.user.id;
    const ownerFilter = buildOwnerFilter(userId);

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find(ownerFilter)
        .sort('-createdAt')
        .skip(skip)
        .limit(safeLimit),
      Notification.countDocuments({
        ...ownerFilter,
        read: { $ne: true },
        isRead: { $ne: true },
      }),
      Notification.countDocuments(ownerFilter),
    ]);

    return ApiResponse.success(res, 'Notifications retrieved successfully', {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: safePage,
        pages: Math.ceil(total / safeLimit),
        limit: safeLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        ...buildOwnerFilter(userId),
      },
      {
        $set: {
          read: true,
          isRead: true,
          readAt: new Date(),
        },
      },
      { new: true }
    );

    if (!notification) {
      return next(new ApiError('Notification not found', 404));
    }

    return ApiResponse.success(res, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany(
      {
        ...buildOwnerFilter(userId),
        $or: [{ read: false }, { isRead: false }],
      },
      {
        $set: {
          read: true,
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return ApiResponse.success(res, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      ...buildOwnerFilter(userId),
    });

    if (!notification) {
      return next(new ApiError('Notification not found', 404));
    }

    return ApiResponse.success(res, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
