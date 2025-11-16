// ====== ОСНОВНОЙ МЕНЕДЖЕР ======
class NotificationManager {
    static instance = null;

    static getInstance() {
        if (!this.instance) this.instance = new NotificationManager();
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
        this.webView = new alt.WebView("http://resource/client/html/index.html");

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

        this.webView.once("load", resolveLoad);
        alt.setTimeout(resolveTimeout, 2000);

        const isLoaded = await Promise.race([loadPromise, timeoutPromise]);

        this.isInitialized = isLoaded;
    }

    createProgressBar(id, title, progress = 0, text = "") {
        const progressBar = new ProgressBar(this, id, title, progress, text);
        progressBar.show();
        return progressBar;
    }

    createTapCounter(id, title, currentTaps = 0, requiredTaps = 0, text = "") {
        const tapCounter = new TapCounter(this, id, title, currentTaps, requiredTaps, text);
        tapCounter.show();
        return tapCounter;
    }

    // ====== ОБЩИЕ МЕТОДЫ ======
    updateWebViewState() {
        if (this.activeNotifications.size === 0) {
            this.isWebViewOpen = false;
            alt.log('updateWebViewState сделал isWebViewOpen = false;');
        }
    }
}

// ====== Базовый класс шаблон ======
class NotificationBase {
    constructor(manager, id) {
        this.manager = manager;        // ссылка на NotificationManager
        this.id = id || `${this.constructor.name}_${Date.now()}`;
        this.data = {};                // общие данные компонента
    }

    // базовые методы для наследников
    show() {}
    update() {}
    hide() {
        if (this.manager.isInitialized) {
            this.manager.activeNotifications.delete(this.id);
            this.manager.updateWebViewState();
        }
    }
}

// ====== Обычное уведомление (Persistent) ======
class PersistentNotification extends NotificationBase {
    constructor(manager, id, title, text = "") {
        super(manager, id);
        this.data = { title, text };
    }

    show() {
        if (!this.manager.isInitialized) return;

        const { title, text } = this.data;
        this.manager.webView.emit("showPersistentNotification", this.id, title, text);
        this.manager.activeNotifications.set(this.id, {
            type: "persistent",
            ...this.data
        });
        this.manager.isWebViewOpen = true;
    }

    update(title, text = "") {
        if (!this.manager.isInitialized) return;

        if (title) this.data.title = title;
        if (text) this.data.text = text;

        this.manager.webView.emit("updatePersistentNotification", this.id, this.data.title, this.data.text);
    }

    hide() {
        if (!this.manager.isInitialized) return;

        this.manager.webView.emit("hidePersistentNotification", this.id);
        super.hide();
    }
}

// ====== ПРОГРЕСС-БАР ======
class ProgressBar extends NotificationBase {
    constructor(manager, id, title, initialProgress = 0, text = "") {
        super(manager, id);
        this.data = { title, progress: initialProgress, text };
    }

    show() {
        if (!this.manager.isInitialized) return;

        const { title, progress, text } = this.data;
        this.manager.webView.emit("showProgressBar", this.id, title, progress, text);
        this.manager.activeNotifications.set(this.id, {
            type: "progress",
            ...this.data
        });
        this.manager.isWebViewOpen = true;
    }

    update(progress, text = "") {
        if (!this.manager.isInitialized) return;

        this.data.progress = progress;
        if (text) this.data.text = text;

        this.manager.webView.emit("updateProgressBar", this.id, progress, text);
    }

    hide() {
        if (!this.manager.isInitialized) return;

        this.manager.webView.emit("hideProgressBar", this.id);
        super.hide();
    }
}

// ====== СЧЕТЧИК НАЖАТИЙ ======
class TapCounter extends NotificationBase {
    constructor(manager, id, title, currentTaps = 0, requiredTaps = 0, text = "") {
        super(manager, id);
        this.data = { title, currentTaps, requiredTaps, text };
    }

    show() {
        if (!this.manager.isInitialized) return;

        const { title, currentTaps, requiredTaps, text } = this.data;
        this.manager.webView.emit("showTapCounter", this.id, title, currentTaps, requiredTaps, text);
        this.manager.activeNotifications.set(this.id, {
            type: "tapCounter",
            ...this.data
        });
        this.manager.isWebViewOpen = true;
    }

    update(currentTaps, text = "") {
        if (!this.manager.isInitialized) return;

        this.data.currentTaps = currentTaps;
        if (text) this.data.text = text;

        this.manager.webView.emit("updateTapCounter", this.id, currentTaps, text);
    }

    hide() {
        if (!this.manager.isInitialized) return;

        this.manager.webView.emit("hideTapCounter", this.id);
        super.hide();
    }
}

