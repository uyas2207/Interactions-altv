import * as alt from 'alt-client';
import * as native from "natives";

import { InteractionType } from './Consts.js';


//вызов гташных уведмолени с помощью нативок 
function drawNotification(message, autoHide = true) {
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

//уведомления через WebView
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
    this.keyUpHandler = null;
    this.inProgress = false;
    this.colshapes = []; // массив для колшейпов
    this.progressController = null;     //флаг для блокировки параллельного выполнения

    this.isProgressRunning = false;

    this.keyPressCooldown = new Map(); // Можно хранить cooldown для разных типов взаимодействий
    this.keyPressDebounce = 1000; // задержка между нажатиями
    this.lastKeyPressTime = 0;

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
            /*
            //прогрэсбар
            NotificationManager.getInstance().showProgressBar('lockpick', 'Взлом замка', 0, '');
            this.progressBar();
            */
            /*
            // множественные нажатия (Упражнения)
            const requiredTaps = 10;
            NotificationManager.getInstance().showTapCounter('exercise', 'Упражнения', 0, requiredTaps, 'Быстро нажимайте E!');
            this.multipleTaps(requiredTaps);
            */
        });

        alt.onServer('client:sceneDemo', () => {
            const position1 = new alt.Vector3(-1275.08, -1431.94, 3.47);    // МАШИНА
            const position2 = new alt.Vector3(-1273.76, -1427.74, 3.34);    // УПРАЖЕНИНИЯ
            const position3 = new alt.Vector3(-1269.45, -1428.14, 3.34);    // АВТОМАТ
            const scale = new alt.Vector3(1.5, 1.5, 1.5)
            const color1 = new alt.RGBA(241, 196, 15);
            const color2 = new alt.RGBA(46, 204, 113);
            const color3 = new alt.RGBA(52, 152, 219);
            const marker1 = new alt.Marker(1, position1, color1);
            marker1.scale = scale;
            const marker2 = new alt.Marker(1, position2, color2);
            marker2.scale = scale
            const marker3 = new alt.Marker(1, position3, color3);
            marker3.scale = scale

            const colshape1 = new alt.ColshapeSphere(position1.x, position1.y, position1.z+1, 1);
            const colshape2 = new alt.ColshapeSphere(position2.x, position2.y, position2.z+1, 1);
            const colshape3 = new alt.ColshapeSphere(position3.x, position3.y, position3.z+1, 1);
            
            colshape1.interactionType = InteractionType.VEHICLE;
            colshape2.interactionType = InteractionType.EXERCISE;
            colshape3.interactionType = InteractionType.VENDING;

            // МАШИНА       POS -1275.08, -1431.94, 4.47      RGBA 241, 196, 15
            // УПРАЖЕНИНИЯ  POS -1273.76, -1427.74, 4.34      RGBA 46, 204, 113
            // АВТОМАТ      POS -1269.65, -1428.26, 4.34      RGBA 52, 152, 219
            this.colshapes.push(colshape1, colshape2, colshape3);
        });

        
        // Обработка входа/выхода из колшейпов
        alt.on('entityEnterColshape', this.startInteraction.bind(this));
        alt.on('entityLeaveColshape', this.stopInteraction.bind(this));
    }

    startInteraction(colshape, entity){
        if (!(entity instanceof alt.Player)) return;

        //проверка на случай если будут добавлены еще колшейпы
        if (colshape.interactionType) {
        const player = entity;
         this.currentColshape = colshape; // Сохраняем текущий колшейп

        switch(colshape.interactionType) {
            case InteractionType.VEHICLE:            
                alt.log(`InteractionType.VEHICLE`);
                drawNotification('Взлом замка');
                NotificationManager.getInstance().showProgressBar('lockpick', 'Взлом замка', 0, '');
                this.progressBar();
                break;
                
            case InteractionType.EXERCISE:
                alt.log(`InteractionType.VEHICLE`);
                drawNotification('Упражнения');
                const requiredTaps = 10;
                NotificationManager.getInstance().showTapCounter('exercise', 'Упражнения', 0, requiredTaps, 'Быстро нажимайте E!');
                this.multipleTaps(requiredTaps);
                break;
                
            case InteractionType.VENDING:
                alt.log(`InteractionType.VEHICLE`);
                drawNotification('Автомат');
                const notifId = NotificationManager.getInstance().showPersistent('Статус', 'Выполняется задача...');
                this.singleTap(notifId);
                //player.currentInteraction = InteractionType.MACHINE;
                break;
        }
        
        
        }
    }

    stopInteraction(colshape, entity){
        if (!(entity instanceof alt.Player)) return;
        
        if (this.progressController && this.inProgress) {
            this.progressController.shouldStop = true;
            alt.log('Процесс runProgress() прерван из-за выхода из колшейпа');
        }

        this.cleanup();

        // Если игрок покидает текущий активный колшейп
        if (this.currentColshape === colshape) {
            this.currentColshape = null;
            alt.log(`Игрок покинул зону взаимодействия`);
        }
    }

    canProcessKeyPress() {  //дебаунс от спаама кнопоками во время интерации
        const currentTime = Date.now();
        const timeSinceLastPress = currentTime - this.lastKeyPressTime;
        
        if (timeSinceLastPress < this.keyPressDebounce) {
            alt.log(`Дебаунс: нажатие проигнорировано (${timeSinceLastPress}ms < ${this.keyPressDebounce}ms)`);
            return false;
        }
        
        this.lastKeyPressTime = currentTime;
        return true;
    }

   async progressBar(){      
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик progressBar')
        }
        this.inProgress = false;
        // Создает новый обработчик для клавиши E
        this.keyPressHandler = async (key) => {
            //дебаунс от спама
            if (!this.canProcessKeyPress()) {
                return;
            }
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen)) {
                this.inProgress = true;
                this.isProgressRunning = true; // Устанавливаем флаг
            
            //необходимость прерывания (если keyup)
            this.progressController = { shouldStop: false };
            
            try {
                await this.runProgress();
            } 
            catch (error) {
                if (error.message === 'Прерывание') {   //проверка на прерывание из runProgress
                    NotificationManager.getInstance().updateProgressBar('lockpick', 0, `Прогресс: 0%`);
                    drawNotification('Процесс прерван!'); //true значит что уведомление пропадет через 3 секунды
                }
            }
            finally {
                    // сбрасываем флаг в любом случае
                    this.isProgressRunning = false;
                }
            }   
        };

    this.keyUpHandler = (key) => {
        if (key === 69 && this.inProgress && this.progressController) {
            this.progressController.shouldStop = true;
        }
    };
    
        // регистрирует обработчики
        alt.on('keydown', this.keyPressHandler);
        alt.on('keyup', this.keyUpHandler);
        alt.log('Созданы обработчики progressBar');
    }

    
    async runProgress() {
        
        if (this.isProgressRunning) {
            alt.log('Предупреждение: runProgress уже выполняется');
            return;
        }

        for (let percentcounter = 1; percentcounter <= 10; percentcounter++) {
            // Проверяем не прерван ли процесс
            if (this.progressController.shouldStop) {
                this.inProgress = false;
                this.isProgressRunning = false; // Сбрасываем флаг
                throw new Error('Прерывание');    //для проверки в catch (error)
            }
        
            NotificationManager.getInstance().updateProgressBar('lockpick', percentcounter/10, `Прогресс: ${percentcounter*10}%`);
            alt.log(`${percentcounter}`);
        
            // Ждем 1 секунду
            await new Promise(resolve => alt.setTimeout(resolve, 1000));
        }
    
        // Завершение
        this.inProgress = false;
        this.isProgressRunning = false; // Сбрасываем флаг
        NotificationManager.getInstance().updateProgressBar('lockpick', 1, `Прогресс: 100%`);
    
        await new Promise(resolve => alt.setTimeout(resolve, 500));
        this.cleanup();
        /*
        NotificationManager.getInstance().hideProgressBar('lockpick');
        alt.log('cleanup + hideProgressBar в progressBar');
        */
        drawNotification('Задача выполнена!');
    }


    singleTap(notifId){
         if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик singleTap')
        }

        // Создает новый обработчик для клавиши E
        this.keyPressHandler = (key) => {
            
            //дебаунс от спама
            if (!this.canProcessKeyPress()) {
                return;
            }
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen)) {

                this.cleanup();

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

                //дебаунс от спама
                if (!this.canProcessKeyPress()) {
                 return;
                }
                // удаляет обработчик после нажатия
                //this.cleanup();
                NotificationManager.getInstance().updateTapCounter('exercise', pressDownCounter, `Осталось: ${requiredTaps-pressDownCounter} раз`);
                //NotificationManager.getInstance().hidePersistent();   //скрыть WebView
                //   return;
                
                alt.log(`Нажали Е, i = ${pressDownCounter}`);

                if (pressDownCounter===requiredTaps){
                    this.cleanup();
                    /*
                    NotificationManager.getInstance().hideTapCounter('exercise');
                    alt.log('cleanup + hideTapCounter');
                    */
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
    // снимаем обработчики клавиш
    if (this.keyPressHandler) {
        alt.off('keydown', this.keyPressHandler);
        this.keyPressHandler = null;
    }
    if (this.keyUpHandler) {
        alt.off('keyup', this.keyUpHandler);
        this.keyUpHandler = null;
    }
    
    this.isProgressRunning = false;
    this.inProgress = false;

    // закрываем активное уведомление, если оно есть
    const notificationManager = NotificationManager.getInstance();

    if (notificationManager.isInitialized && notificationManager.activeNotifications.size > 0) {
        for (const [id, notification] of notificationManager.activeNotifications.entries()) {
            switch (notification.type) {
                case 'persistent':
                    notificationManager.hidePersistent(id);
                    alt.log(`cleanup(): скрыт persistent (${id})`);
                    break;

                case 'progress':
                    notificationManager.hideProgressBar(id);
                    alt.log(`cleanup(): скрыт progress-bar (${id})`);
                    break;

                case 'tapCounter':
                    notificationManager.hideTapCounter(id);
                    alt.log(`cleanup(): скрыт tapCounter (${id})`);
                    break;

                default:
                    alt.log(`cleanup(): неизвестный тип уведомления — ${notification.type}`);
                    break;
            }
        }
    }

    alt.log('cleanup(): завершён — все обработчики и уведомления очищены.');
}

}

new Interaction();

/*
// 1. Базовый абстрактный класс
class BaseInteraction {
    constructor(type, id, title) {}
    startInteraction(){ 
    
    }

    stopInteraction() {

    }

    updateInteraction() { 
        
    }

    getInteractionText() { 

    }
}

// 2. Конкретные реализации
class SingleTapInteraction extends BaseInteraction {
    // специализированная логика для одиночного нажатия
}

class ProgressInteraction extends BaseInteraction {
    // специализированная логика для прогресс-бара  
}

class MultiTapInteraction extends BaseInteraction {
    // специализированная логика для множественных нажатий
}

// 3. Менеджер взаимодействий
class InteractionManager {
    constructor() {
        this.interactions = new Map();
        this.activeInteraction = null;
    }
    
    registerInteraction(id, interaction) {
        this.interactions.set(id, interaction);
    }
    
    // делегирование методов активной интеракции
    startInteraction(id) {
        this.activeInteraction = this.interactions.get(id);
        this.activeInteraction.startInteraction();
    }
}
*/

