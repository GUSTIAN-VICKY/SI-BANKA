/**
 * Browser Notification Utility Functions
 * Uses the Web Notifications API for browser-native notifications
 */

// Check if browser supports notifications
export const isNotificationSupported = () => {
    return 'Notification' in window;
};

// Get current notification permission status
export const getNotificationPermission = () => {
    if (!isNotificationSupported()) return 'unsupported';
    return Notification.permission; // 'granted', 'denied', or 'default'
};

// Request notification permission from user
export const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) {
        console.warn('Browser does not support notifications');
        return 'unsupported';
    }

    try {
        const permission = await Notification.requestPermission();
        return permission;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'error';
    }
};

// Show a notification
export const showNotification = (title, options = {}) => {
    if (!isNotificationSupported()) {
        console.warn('Browser does not support notifications');
        return null;
    }

    if (Notification.permission !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    const defaultOptions = {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200],
        tag: 'sibanka-notification',
        renotify: true,
        ...options
    };

    try {
        const notification = new Notification(title, defaultOptions);

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        // Handle click - focus the window
        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    } catch (error) {
        console.error('Error showing notification:', error);
        return null;
    }
};

// Stock notification - when stock is getting full
export const notifyStockFull = (itemName, currentStock) => {
    const enabled = localStorage.getItem('notifStock') !== 'false';
    if (!enabled) return null;

    return showNotification('📦 Stok Hampir Penuh!', {
        body: `${itemName} mencapai ${currentStock} kg. Pertimbangkan untuk menjual ke pengepul.`,
        tag: 'stock-alert',
        icon: '📦'
    });
};

// Transaction notification - when new transaction is created
export const notifyNewTransaction = (customerName, total) => {
    const enabled = localStorage.getItem('notifTrx') === 'true';
    if (!enabled) return null;

    // Import dynamically to avoid circular dependency at module level
    const formattedTotal = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(total);

    return showNotification('💰 Transaksi Baru!', {
        body: `Setoran dari ${customerName} sebesar ${formattedTotal} berhasil dicatat.`,
        tag: 'transaction-alert',
        icon: '💰'
    });
};
