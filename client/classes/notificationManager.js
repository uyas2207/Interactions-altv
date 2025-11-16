// Базовый класс для уведомлений через WebView
class NotificationManager {
    static instance = null;
    
    static getInstance() {
        if (!this.instance) {
            alt.log('instance создан в первый раз:');
            this.instance = new NotificationManager();
        }
        return this.instance;
    }

    constructor() {
        if (NotificationManager.instance) {
            alt.log('Повторный вызов constructor NotificationManager');
            return NotificationManager.instance;
        }
        
        this.webView = null;
        this.isInitialized = false;
        this.isWebViewOpen = false;
        this.activeNotifications = new Map();

        NotificationManager.instance = this;
    }
    
    async initialize() {
        if (this.isInitialized) {
            alt.log('NotificationManager уже инициализирован (ПОВТОРНАЯ ПОПЫТКА ВЫЗОВА INITIALIZE)');
            return;
        }
        await this.init();
    }

    async init() {
        this.webView = new alt.WebView('http://resource/client/html/index.html');

        let resolveLoad, resolveTimeout;
        let isResolved = false;

        const loadPromise = new Promise((resolve) => {
            resolveLoad = () => {
                if (!isResolved) {
                    isResolved = true;
                    resolve(true);
                }
            };
        });

        const timeoutPromise = new Promise((resolve) => {
            resolveTimeout = () => {
                if (!isResolved) {
                    isResolved = true;
                    resolve(false);
                }
            };
        });

        this.webView.once('load', resolveLoad);
        alt.setTimeout(resolveTimeout, 2000);

        const isLoaded = await Promise.race([loadPromise, timeoutPromise]);
        
        if (isLoaded) {
            this.isInitialized = true;
            alt.log('Notification manager initialized SUCCESS');
        } else {
            alt.log('Notification manager did not initialize FAILURE (timeout)');
        }
    }

    // Базовый метод для создания уведомления
    _createNotification(id, type, title, text, data = {}) {
        if (!this.isInitialized) {
            alt.log('Notification manager не инициализирован');
            return null;
        }
        
        this.activeNotifications.set(id, { 
            type, 
            title, 
            text,
            ...data 
        });
        this.isWebViewOpen = true;

        return id;
    }

    // Базовый метод для обновления уведомления
    _updateNotification(id, updates = {}) {
        if (this.isInitialized && this.activeNotifications.has(id)) {
            const notification = this.activeNotifications.get(id);
            Object.assign(notification, updates);
            return true;
        }
        return false;
    }

    // Базовый метод для скрытия уведомления
    _hideNotification(id, eventName = 'hidePersistentNotification') {
        if (this.isInitialized) {
            this.webView.emit(eventName, id);
            this.activeNotifications.delete(id);
            this.updateWebViewState();
        }
    }
    
}

// Класс для управления основными уведомлениями
class PersistentNotificationManager extends NotificationManager {
    static getInstance() {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new PersistentNotificationManager();
        }
        return NotificationManager.instance;
    }

    constructor() {
        super();
    }

    // ========== ОСНОВНЫЕ УВЕДОМЛЕНИЯ ==========
    
    show(title, text, id = null) {
        const notificationId = id || `persistent_${Date.now()}`;
        this.emitToWebView('showPersistentNotification', notificationId, title, text);
        return this._createNotification(notificationId, 'persistent', title, text);
    }

    hide(id) {
        this._hideNotification(id, 'hidePersistentNotification');
    }

    // Обновление существующего уведомления
    update(id, title, text) {
        if (this._updateNotification(id, { title, text })) {
            this.emitToWebView('showPersistentNotification', id, title, text);
            return true;
        }
        return false;
    }

}

// Класс для управления прогресс-барами
class ProgressBarManager extends NotificationManager {
    static getInstance() {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new ProgressBarManager();
        }
        return NotificationManager.instance;
    }

    constructor() {
        super();
    }

    show(id, title, initialProgress = 0, text = '') {
        this.emitToWebView('showProgressBar', id, title, initialProgress, text);
        return this._createNotification(id, 'progress', title, text, {
            progress: initialProgress
        });
    }
    
    update(id, progress, text = '') {
        if (this._updateNotification(id, { progress, text })) {
            this.emitToWebView('updateProgressBar', id, progress, text);
        }
    }
    
    hide(id) {
        this._hideNotification(id, 'hideProgressBar');
    }

}

// Класс для управления счетчиками нажатий
class TapCounterManager extends NotificationManager {
    static getInstance() {
        if (!NotificationManager.instance) {
            NotificationManager.instance = new TapCounterManager();
        }
        return NotificationManager.instance;
    }

    constructor() {
        super();
    }

    show(id, title, currentTaps = 0, requiredTaps = 0, text = '') {
        this.emitToWebView('showTapCounter', id, title, currentTaps, requiredTaps, text);
        return this._createNotification(id, 'tapCounter', title, text, {
            currentTaps: currentTaps,
            requiredTaps: requiredTaps
        });
    }
    
    update(id, currentTaps, text = '') {
        if (this._updateNotification(id, { currentTaps, text })) {
            this.emitToWebView('updateTapCounter', id, currentTaps, text);
        }
    }
    
    hide(id) {
        this._hideNotification(id, 'hideTapCounter');
    }

}