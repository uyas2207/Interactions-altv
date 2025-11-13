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

    //управление асинхронными операциями
    this.currentProgressPromise = null;
    this.progressController = null;

    //this.keyPressCooldown = new Map(); // Можно хранить cooldown для разных типов взаимодействий
    this.keyEDebounceMs = 500; // задержка между нажатиями
    this.lastKeyEPressTime = 0;

    this.isKeyEHeld = false;    //отслеживание состояния клавиши E

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
        
        //для тестирования разных типов взаимодействий
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

        
        // обработка входа/выхода из колшейпов
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
                break;
        }
        
        
        }
    }

    stopInteraction(colshape, entity){
        //проверяем, что entity является игроком, а не другим типом сущности (транспорт, NPC и т.д.)
        if (!(entity instanceof alt.Player)) return;
        
        //отменяет прогрессбар при выходе из колшейпа
        if (this.currentProgressPromise) {
            alt.log('Отмена прогресса из-за выхода из колшейпа');
            // вызываем метод отмены прогресса, который установит флаг shouldStop
            this.cancelProgress();
        }

        // вызываем общий метод очистки для удаления обработчиков и сброса состояния
        this.cleanup();

        // если игрок покидает текущий активный колшейп
        // сравниваем колшейп, который покидает игрок, с текущим активным колшейпом
        if (this.currentColshape === colshape) {
            // сбрасываем текущий активный колшейп, так как игрок вышел из него
            this.currentColshape = null;
            alt.log(`Игрок покинул зону взаимодействия`);
        }
    }

    // метод для обработки дебаунса (защиты от спама) нажатий клавиш
    canProcessKeyPress(key) {
        // Проверяем дебаунс только для клавиши E (код 69 соответствует клавише E)
        if (key === 69) {
            // Получаем текущее время в миллисекундах
            const currentTime = Date.now();
            // Вычисляем сколько времени прошло с последнего нажатия клавиши E
            const timeSinceLastPress = currentTime - this.lastKeyEPressTime;
            
            // Если прошло меньше времени, чем установленный дебаунс, игнорируем нажатие
            if (timeSinceLastPress < this.keyEDebounceMs) {
                alt.log(`Дебаунс E: нажатие проигнорировано (${timeSinceLastPress}ms < ${this.keyEDebounceMs}ms)`);
                return false; // Запрещаем обработку нажатия
            }
            
            // Обновляем время последнего нажатия клавиши E на текущее время
            this.lastKeyEPressTime = currentTime;
        }
        
        // Для других клавиш дебаунс не применяется - всегда разрешаем обработку
        return true;
    }

    //метод для отмены прогресса
    //прерывает выполнение runProgress
    cancelProgress() {
        // Проверяем, что progressController существует
        if (this.progressController) {
            // Устанавливаем флаг, который будет проверяться в runProgress для прерывания
            this.progressController.shouldStop = true;
            alt.log('Прогресс отменен через cancelProgress');
        }
    }

    // основной метод для настройки обработки прогресс-бара (долгого зажатия E)
   async progressBar(){      
        // если уже существует обработчик keydown, удаляем его чтобы избежать дублирования (таких ситуаций не бывает в коде)
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик progressBar')
        }
        // если уже существует обработчик keyup, удаляем его чтобы избежать дублирования (таких ситуаций не бывает в коде)
        if (this.keyUpHandler) {
            alt.off('keyup', this.keyUpHandler);
            alt.log('Удален обработчик keyup progressBar')
        }
        // сбрасывает флаг выполнения процесса
        this.inProgress = false;
        // сбрасывает флаг зажатой клавиши E (важно при повторной активации)
        this.isKeyEHeld = false;
        
        // создает новый обработчик для клавиши E (нажатие)
        this.keyPressHandler = async (key) => {
            //реагирует только на клавишу E
            if (key !== 69) return;
            
            //дебаунс от спама - проверяем можно ли обработать это нажатие
            if (!this.canProcessKeyPress(key)) {
                return; // если дебаунс активен, отменяет последующие действия
            }
            
            //устанавливаем флаг что клавиша E нажата
            //этот флаг будет использоваться в runProgress для определения отпущена ли клавиша
            this.isKeyEHeld = true;
            
            //проверка на уже запущенный прогресс
            //если уже выполняется другой процесс прогресса, отменяем его (таких ситуаций не бывает в коде)
            if (this.currentProgressPromise) {
                alt.log('Прогресс уже выполняется, отменяем предыдущий');
                // Устанавливаем флаг прерывания для текущего прогресса
                this.cancelProgress();
                // Ждем завершения предыдущего промиса (асинхронная отмена)
                try {
                    // Ожидаем завершения предыдущего прогресса, игнорируя ошибки
                    await this.currentProgressPromise.catch(() => {});
                    alt.log('Предыдущий прогресс завершен');
                } catch (error) {
                    alt.log(`Ошибка при ожидании предыдущего прогресса: ${error.message}`);
                }
            }
            
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки
            //проверка, что WebView открыт и готов к отображению прогресса
            if (NotificationManager.getInstance().isWebViewOpen) {
                //устанавливает флаг что процесс выполняется
                this.inProgress = true;
                //создаем новый контроллер прогресса с флагом остановки
                this.progressController = { shouldStop: false };
                
                alt.log('Запуск нового прогресса...');
                
                //создает и сохраняет Promise для отслеживания выполнения runProgress
                this.currentProgressPromise = this.runProgress()
                    //обработка успешного завершения прогресса
                    .then(() => {
                        alt.log('Прогресс завершен успешно');
                    })
                    //единственный способ прервать выполнение прогресса(происходит после того как игрок отпустит E и в runProgress сработает проверка на зажатую E)
                    .catch((error) => {
                        //преднамеренное прерывание
                        if (error.message === 'Прерывание') {
                            alt.log('Прогресс прерван');
                            // сбрасывает прогрессбар в начальное состояние
                            NotificationManager.getInstance().updateProgressBar('lockpick', 0, `Прогресс: 0%`);
                            drawNotification('Процесс прерван!');
                        }
                    })
                    //выполняется в любом случае - при успехе или ошибке
                    .finally(() => {
                        // сбрасываем ссылку на Promise чтобы разрешить новый запуск
                        this.currentProgressPromise = null;
                        alt.log('Промис прогресса очищен в finally');
                    });
            }   
        };

        // Обработчик отпускания клавиши E
        this.keyUpHandler = (key) => {
            // игнорирует отпускание других клавиш
            if (key !== 69) return;
            
            // сбрасывает флаг что клавиша E зажата
            this.isKeyEHeld = false;
            
            // Если процесс выполняется
            if (this.inProgress && this.progressController) {
                // устанавливает флаг остановки для прерывания runProgress
                this.progressController.shouldStop = true;
                alt.log('Клавиша E отпущена, установлен shouldStop');
            }
        };
    
        // Создаются обработчики событий
        alt.on('keydown', this.keyPressHandler);
        alt.on('keyup', this.keyUpHandler);
        alt.log('Созданы обработчики progressBar');
    }

    
    // основной метод выполнения прогресса (взлома)
async runProgress() {
    alt.log('runProgress начал выполнение');
    
    // цикл из 10 шагов прогресса (от 10% до 100%)
    for (let percentcounter = 1; percentcounter <= 10; percentcounter++) {
        // обнволение прогрессбара визуально
        NotificationManager.getInstance().updateProgressBar('lockpick', percentcounter/10, `Прогресс: ${percentcounter*10}%`);
        alt.log(`Прогресс: ${percentcounter}/10`);
    
        // ожидание 1 секунды с возможностью прерывания и гарантированной очисткой обработчиков timeout и interval
        await new Promise((resolve, reject) => {
            // для проверки от множественного вызова resolve/reject
            let isResolved = false;
            
            // функции для безопасного завершения Promise с очисткой timeout и interval
            const safeResolve = () => {
                if (!isResolved) {
                    isResolved = true;
                    alt.clearTimeout(timeout);
                    alt.clearInterval(interval);
                    alt.log(`Произошел safeResolve`);
                    resolve();
                }
            };
            
            const safeReject = (error) => {
                if (!isResolved) {
                    isResolved = true;
                    alt.clearTimeout(timeout);
                    alt.clearInterval(interval);
                    alt.log(`Произошел safeReject`);
                    reject(error);
                }
            };
            
            // ВАРИАНТ 1: УСПЕШНОЕ ЗАВЕРШЕНИЕ
            // Таймер который вызовет safeResolve() через 1 секунду
            const timeout = alt.setTimeout(() => {
                safeResolve();
                alt.log(`Шаг ${percentcounter} завершен успешно`);
            }, 1000);
            
            // ВАРИАНТ 2: ПРЕРЫВАНИЕ
            // Интервал который проверяет условия прерывания каждые 200ms
            const interval = alt.setInterval(() => {
                // Игрок отпустил клавишу -> Была запрошена остановка
                if (this.progressController.shouldStop) {
                    safeReject(new Error('Прерывание'));
                    alt.log(`Шаг ${percentcounter} прерван`);
                }
            }, 200); // проверяет каждые 200 миллисекунд
        });
    }
    
    // финальное отображение после того как прогресс бар дошел до конца
    this.inProgress = false;
    NotificationManager.getInstance().updateProgressBar('lockpick', 1, `Прогресс: 100%`);
    alt.log('runProgress завершил цикл - ВЗЛОМ УСПЕШЕН!');

    // задержка что бы игрок успел увидеть 100%
    await new Promise(resolve => alt.setTimeout(resolve, 500));
    
    // очистка, закрытие Webview и показ финального уведомления
    this.cleanup();
    drawNotification('Задача выполнена!');
}

    singleTap(notifId){
         if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик singleTap')
        }

        // Создает новый обработчик для клавиши E
        this.keyPressHandler = async (key) => {
            
            //дебаунс от спама
            if (!this.canProcessKeyPress()) {
                return;
            }
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationManager.getInstance().isWebViewOpen)) {

                this.cleanup();

                await this.playButtonPressAnimation();

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
        alt.log('Начало cleanup...');
        
        //отменяем текущий прогресс при cleanup
        if (this.currentProgressPromise) {
            alt.log('Отмена прогресса в cleanup');
            this.cancelProgress();
            this.currentProgressPromise = null;
        }
        
        // снимаем обработчики клавиш
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            this.keyPressHandler = null;
            alt.log('Обработчик keydown удален');
        }
        if (this.keyUpHandler) {
            alt.off('keyup', this.keyUpHandler);
            this.keyUpHandler = null;
            alt.log('Обработчик keyup удален');
        }
        
        this.inProgress = false;
        // ДОБАВЛЕНО: сбрасываем состояние клавиши
        this.isKeyEHeld = false;

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

// ВАРИАНТ 4: Анимация взаимодействия с автоматом
async playButtonPressAnimation() {
    alt.log('Запуск анимации нажатия на кнопку...');
    
    const player = alt.Player.local;
    
    try {
        // 1. БЛОКИРУЕМ УПРАВЛЕНИЕ ИГРОКОМ
        native.freezeEntityPosition(player, true);
        native.setPedCanSwitchWeapon(player, false);
        
        // 2. ПРОИГРЫВАЕМ АНИМАЦИЮ НАЖАТИЯ НА КНОПКУ
        // Загружаем библиотеку анимаций
        await this.loadAnimDict('mp_common');
        
        // Проигрываем анимацию нажатия на кнопку
        native.taskPlayAnim(
            player, 
            'mp_common', 
            'givetake1_a', 
            8.0, // скорость
            -8.0, 
            -1, 
            48, // флаги: 16 = останавливается в конце, 32 = управление движением
            0, 
            false, 
            false, 
            false
        );
        
        // ЖДЕМ ЗАВЕРШЕНИЯ АНИМАЦИИ (примерно 1-2 секунды)
        await new Promise(resolve => alt.setTimeout(resolve, 2000));
        
        // 3. ОСТАНАВЛИВАЕМ АНИМАЦИЮ
        native.stopAnimTask(player, 'mp_common', 'givetake1_a', 1.0);
        
    } catch (error) {
        alt.log(`Ошибка при проигрывании анимации: ${error.message}`);
    } finally {
        // 4. ВОССТАНАВЛИВАЕМ УПРАВЛЕНИЕ ИГРОКОМ
        native.freezeEntityPosition(player, false);
        native.setPedCanSwitchWeapon(player, true);
        
        // 5. ОЧИЩАЕМ ПАМЯТЬ ОТ АНИМАЦИЙ
        this.unloadAnimDict('mp_common');
        
        alt.log('Анимация нажатия на кнопку завершена');
    }
}

// ДОБАВЛЕНО: метод для загрузки словаря анимаций
async loadAnimDict(dict) {
    return new Promise((resolve) => {
        // Проверяем уже загружен ли словарь
        if (native.hasAnimDictLoaded(dict)) {
            resolve(true);
            return;
        }
        
        // Загружаем словарь анимаций
        native.requestAnimDict(dict);
        
        // Ждем загрузки
        const interval = alt.setInterval(() => {
            if (native.hasAnimDictLoaded(dict)) {
                alt.clearInterval(interval);
                resolve(true);
                alt.log(`Словарь анимаций '${dict}' загружен`);
            }
        }, 100);
        
        // Таймаут на случай если анимация не загрузится
        alt.setTimeout(() => {
            alt.clearInterval(interval);
            resolve(false);
            alt.log(`Таймаут загрузки словаря анимаций '${dict}'`);
        }, 5000);
    });
}

// ДОБАВЛЕНО: метод для выгрузки словаря анимаций
unloadAnimDict(dict) {
    native.removeAnimDict(dict);
    alt.log(`Словарь анимаций '${dict}' выгружен`);
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

