import * as alt from 'alt-client';
import * as native from "natives";

//уведомления через WebView

//вызов гташных уведмолени с помощью нативок 
function drawNotification(message, autoHide = false) {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(message);
    const notificationId = native.endTextCommandThefeedPostTicker(false, false);
    // Таймер для скрытия уведомления через 3 секунды если кроме текста сообщения также передали true
    if (autoHide) {
        setTimeout(() => {
            native.thefeedRemoveItem(notificationId);
        }, 3000);
    }
}
//для вызова уведомлений со стороны сервера
alt.onServer('drawNotification', drawNotification);

class NotificationManager {
    static instance = null;    //для хранения единственного экземпляра класса
    //глобальный метод для получение экземпляра класса (информации о состоянии WebView)
    static getInstance() {
        if (!this.instance) {   // если экземпляр не существует создает его
            alt.log('instance создан в первый раз:');
            this.instance = new NotificationManager();
        }
        alt.log('Передан instance:');
        alt.log(`this.instance: ${JSON.stringify(this.instance, null, '\t')}`);
        // возвращает существующий или только что созданный экземпляр
        return this.instance;
    }

    constructor() {
        //проверка если NotificationManager уже создан ранее то осатльной код constructor не пройдет (по идее таких ситуаций быть не может)
        if (NotificationManager.instance) {
            alt.log('Повторный вызов constructor NotificationManager');
            return NotificationManager.instance;
        }
        
        this.webView = null;
        this.isInitialized = false;
        this.isWebViewOpen = false;
        this.activeNotifications = new Map(); // Для отслеживания активных уведомлений

        //сохраняет созданный экземпляр
        alt.log(`Созданный экземпляр: ${JSON.stringify(this, null, '\t')}`);
        NotificationManager.instance = this;
    }
    
    async initialize() {
        // если уже инициализирован, ничего не делает (по идее таких ситуаций быть не может)
        if (this.isInitialized) {
            alt.log('NotificationManager уже инициализирован (ПОВТОРНАЯ ПОПЫТКА ВЫЗОВА INITIALIZE)');
            return;
        }
        // запуск инициализации
        await this.init();
    }

    async init() {
        this.webView = new alt.WebView('http://resource/client/html/index.html');

            const loadPromise = new Promise((resolve) => {
                this.webView.once('load', () => resolve(true));
            });
            
            const timeoutPromise = new Promise((resolve) => {
                alt.setTimeout(() => resolve(false), 2000);
            });
            //если WebView не загрузится за 2 секунды будет isLoaded = false
            const isLoaded = await Promise.race([loadPromise, timeoutPromise]);
            
            if (isLoaded) {
                this.isInitialized = true;
                alt.log('Notification manager initialized SUCCESS');
            } else {
                alt.log('Notification manager did not initialize FAILURE (timeout)');
            }
    }

    showPersistent(title, text, id = null) {
        if (!this.isInitialized) {
            alt.log('Notification manager не инициализирован');
            return null;
        }
        
        const notificationId = id || `persistent_${Date.now()}`;
        this.webView.emit('showPersistentNotification', notificationId, title, text);
        this.activeNotifications.set(notificationId, { type: 'persistent', title, text });
        this.isWebViewOpen = true;

        return notificationId;
    }

    hidePersistent(id) {
        if (!this.isInitialized) {
            alt.log('Попытка скрыть Notification при isInitialized === null');
            return;
        }
        
        this.webView.emit('hidePersistentNotification', id);
        this.activeNotifications.delete(id);
        this.updateWebViewState();
    }

    // ========== ПРОГРЕСС-БАРЫ (WebView) ==========
    
    showProgressBar(id, title, initialProgress = 0, text = '') {
        if (!this.isInitialized) {
            alt.log('Notification manager не инициализирован');
            return null;
        }
        
        this.webView.emit('showProgressBar', id, title, initialProgress, text);
        this.activeNotifications.set(id, { 
            type: 'progress', 
            title, 
            progress: initialProgress,
            text 
        });
        this.isWebViewOpen = true;
        
        return id;
    }
    
    updateProgressBar(id, progress, text = '') {
        if (this.isInitialized && this.activeNotifications.has(id)) {
            const notification = this.activeNotifications.get(id);
            if (notification.type === 'progress') {
                notification.progress = progress;
                if (text) notification.text = text;
                this.webView.emit('updateProgressBar', id, progress, text);
            }
        }
    }
    
    hideProgressBar(id) {
        if (this.isInitialized) {
            this.webView.emit('hideProgressBar', id);
            this.activeNotifications.delete(id);
            this.updateWebViewState();
        }
    }

    // ========== СЧЕТЧИКИ НАЖАТИЙ (WebView) ==========
    
    showTapCounter(id, title, currentTaps = 0, requiredTaps = 0, text = '') {
        if (!this.isInitialized) {
            alt.log('Notification manager не инициализирован');
            return null;
        }
        
        this.webView.emit('showTapCounter', id, title, currentTaps, requiredTaps, text);
        this.activeNotifications.set(id, { 
            type: 'tapCounter', 
            title,
            currentTaps: currentTaps, 
            requiredTaps: requiredTaps,
            text
        });
        this.isWebViewOpen = true;
        
        return id;
    }
    
    updateTapCounter(id, currentTaps, text = '') {
        if (this.isInitialized && this.activeNotifications.has(id)) {
            const notification = this.activeNotifications.get(id);
            if (notification.type === 'tapCounter') {
                notification.currentTaps = currentTaps;
                if (text) notification.text = text;
                this.webView.emit('updateTapCounter', id, currentTaps, text);
            }
        }
    }
    
    hideTapCounter(id) {
        if (this.isInitialized) {
            this.webView.emit('hideTapCounter', id);
            this.activeNotifications.delete(id);
            this.updateWebViewState();
        }
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========
    
    updateWebViewState() {
        if (this.activeNotifications.size === 0) {
            this.isWebViewOpen = false;
            alt.log('updateWebViewState сделал isWebViewOpen = false;');
        }
    }
    
    hasActiveNotifications() {
        return this.activeNotifications.size > 0;
    }
    
    getActiveNotificationsCount() {
        return this.activeNotifications.size;
    }
    
    clearAllNotifications() {
        if (!this.isInitialized) return;
        
        for (const id of this.activeNotifications.keys()) {
            this.webView.emit('hidePersistentNotification', id);
        }
        
        this.activeNotifications.clear();
        this.isWebViewOpen = false;
    }
    
    getNotificationInfo(id) {
        return this.activeNotifications.get(id);
    }
    
    hasNotification(id) {
        return this.activeNotifications.has(id);
    }

    // ========== ДЕСТРУКТОР ==========
    
    destroy() {
        this.clearAllNotifications();
        if (this.webView) {
            this.webView.destroy();
        }
        this.isInitialized = false;
        this.isWebViewOpen = false;
        NotificationManager.instance = null;
    }
}

class Interaction {
    constructor() {
    this.keyPressHandler = null;
    this.inProgress = false;

    this.initializeNotificationManager();
    this.init();
    }

    // метод для инициализации NotificationManager
    async initializeNotificationManager() {
        alt.log('1. Инициализация NotificationManager');
        // получает экземпляр Singleton (создается при первом вызове)
        const notificationManager = NotificationManager.getInstance();
        
        //инициализирует WebView
        await notificationManager.initialize();
            
        alt.log('1. NotificationManager инициализирован через Interaction');
    }

    init(){
        alt.onServer('client:showNotification', () => {
            //для 1 нажаия
            /*
            const notifId = NotificationManager.getInstance().showPersistent('Статус', 'Выполняется задача...');
            this.singleTap(notifId);
            */
            
            //прогрэсбар
            NotificationManager.getInstance().showProgressBar('lockpick', 'Взлом замка', 0, '');
            this.progressBar();
            
            /*
            // множественные нажатия (Упражнения)
            const requiredTaps = 10;
            NotificationManager.getInstance().showTapCounter('exercise', 'Упражнения', 0, requiredTaps, 'Быстро нажимайте E!');
            this.multipleTaps(requiredTaps);
            */
        });
    }

    progressBar(){      
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик progressBar')
        }
        let percentcounter = 1;
        // Создает новый обработчик для клавиши E
        this.keyPressHandler = (key) => {
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen)) {
                this.inProgress = true;
                let intervalId = setInterval(() => {
                        if (percentcounter < 10) {
                            NotificationManager.getInstance().updateProgressBar('lockpick', `0.${percentcounter}`, `Прогресс: ${percentcounter/10}%`);  //0.5 progress насколько заполнена полоска
                            alt.log(`${percentcounter}`);
                            percentcounter++; 
                        } else {
                            clearInterval(intervalId);
                            NotificationManager.getInstance().updateProgressBar('lockpick', `${percentcounter/10}`, `Прогресс: ${percentcounter*10}%`);
                            new Promise(resolve => alt.setTimeout(resolve, 500))
                            .then(() => {
                                this.cleanup();
                                NotificationManager.getInstance().hideProgressBar('lockpick');
                                alt.log('cleanup + hideProgressBar в progressBar');
                                drawNotification('Задача выполнена!');
                            });
                        }
                    }, 1000);
            }   
        };

        // регистрирует обработчик
        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик нажатия Е')
    }

    singleTap(notifId){
         if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик singleTap')
        }

        // Создает новый обработчик для клавиши E
        this.keyPressHandler = (key) => {
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen)) {

                this.cleanup();
                NotificationManager.getInstance().hidePersistent(notifId);
                alt.log('cleanup + hidePersistent в singleTap');
                drawNotification('Задача выполнена!');
            }   
        };

        // регистрирует обработчик
        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик нажатия Е')
    }

    multipleTaps(requiredTaps){
  
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик multipleTaps')
        }

        let pressDownCounter = 1;
        // Создает новый обработчик для клавиши E
        this.keyPressHandler = (key) => {
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen)) {

                // удаляет обработчик после нажатия
                //this.cleanup();
                NotificationManager.getInstance().updateTapCounter('exercise', requiredTaps-pressDownCounter, `Осталось: ${requiredTaps-pressDownCounter} раз`);
                //NotificationManager.getInstance().hidePersistent();   //скрыть WebView
                //   return;
                
                alt.log(`Нажали Е, i = ${pressDownCounter}`);

                if (pressDownCounter===requiredTaps){
                    this.cleanup();
                    NotificationManager.getInstance().hideTapCounter('exercise');
                    alt.log('cleanup + hideTapCounter');
                    drawNotification('Задача выполнена!');
                }
                pressDownCounter++;
            }   
        };

        // регистрирует обработчик
        alt.on('keydown', this.keyPressHandler);
        alt.log('Создан обработчик нажатия Е')
    }

     cleanup() {
            if (this.keyPressHandler) {
                alt.off('keydown', this.keyPressHandler);
                alt.log('Удален обработчик cleanup');
                this.keyPressHandler = null;
            }
        }
}

new Interaction();