import * as alt from 'alt-client';
import * as native from "natives";

import { InteractionType } from './Consts.js';
//import { InteractionType } from './classes/notificationManager.js';

function wait(ms){
    return new Promise(resolve => alt.setTimeout(resolve, ms));
}
//вызов гташных уведмолени с помощью нативок 
function drawNotification(message, autoHide = true) {
    native.beginTextCommandThefeedPost('STRING');
    native.addTextComponentSubstringPlayerName(message);
    const notificationId = native.endTextCommandThefeedPostTicker(false, false);
    // Таймер для скрытия уведомления через 3 секунды если кроме текста сообщения также передали true
    if (autoHide) {
        alt.setTimeout(() => {
            native.thefeedRemoveItem(notificationId);
        }, 3000);
    }
}
//для вызова уведомлений со стороны сервера
alt.onServer('drawNotification', drawNotification);

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
    this.keyEDebounceMs = 1500; // задержка между нажатиями
    this.lastKeyEPressTime = 0;

    this.isKeyEHeld = false;    //отслеживание состояния клавиши E

    this.initializeNotificationSystem();
    this.init();
    }

    // метод для инициализации NotificationManager
    async initializeNotificationManager() {
        alt.log('1. Инициализация NotificationManager');
        // получает экземпляр Singleton (создается при первом вызове)
        //const notificationManager = NotificationSystem.getInstance();
        
        //инициализирует WebView
        await NotificationSystem.getInstance().initialize();
            
        alt.log('1. NotificationManager инициализирован через Interaction');
    }

    init(){
        
        //для тестирования разных типов взаимодействий
        alt.onServer('client:showNotification', () => {
            //для 1 нажаия
            /*
            const notifId = NotificationSystem.getInstance().showPersistent('Статус', 'Выполняется задача...');
            this.singleTap(notifId);
            */
            /*
            //прогрэсбар
            NotificationSystem.getInstance().showProgressBar('lockpick', 'Взлом замка', 0, '');
            this.progressBar();
            */
            /*
            // множественные нажатия (Упражнения)
            const requiredTaps = 10;
            NotificationSystem.getInstance().showTapCounter('exercise', 'Упражнения', 0, requiredTaps, 'Быстро нажимайте E!');
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

            //загрузка необходимых анимаций
            this.loadAnimDict('mini@sprunk');
            this.loadAnimDict('amb@world_human_push_ups@male@base');
            this.loadAnimDict('amb@world_human_push_ups@male@idle_a');
            this.loadAnimDict('amb@world_human_push_ups@male@exit');
            this.loadAnimDict('amb@world_human_stand_mobile@male@text@base');
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
                NotificationSystem.getInstance().progress.show('lockpick', 'Взлом замка', 0, '');
                this.progressBar();
                break;
                
            case InteractionType.EXERCISE:
                alt.log(`InteractionType.EXERCISE`);
                drawNotification('Отжимания');
                const requiredTaps = 10;
                NotificationSystem.getInstance().tapCounter.show('exercise', 'Отжимания', 0, requiredTaps, 'Быстро нажимайте E!');
                this.multipleTaps(requiredTaps);
                break;
                
            case InteractionType.VENDING:
                alt.log(`InteractionType.VENDING`);
                drawNotification('Автомат');
                const notifId = NotificationSystem.getInstance().persistent.show('Торговый автомат', 'Нажмите E что бы купить напиток');
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
            if (NotificationSystem.getInstance().isReady) {
                //устанавливает флаг что процесс выполняется
                this.inProgress = true;
                //создаем новый контроллер прогресса с флагом остановки
                this.progressController = { shouldStop: false };
                
                alt.log('Запуск нового прогресса...');
                native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_stand_mobile@male@text@base' , 'base', 8.0, -8.0, -1, 49, 0, false, false, false);
                //создает и сохраняет Promise для отслеживания выполнения runProgress
                this.currentProgressPromise = this.runProgress()
                    //обработка успешного завершения прогресса
                    .then(() => {
                        alt.log('Прогресс завершен успешно');
                        drawNotification('Задача выполнена!');    
                        // очистка, закрытие Webview и показ финального уведомления
                        this.cleanup();
                    })
                    //единственный способ прервать выполнение прогресса(происходит после того как игрок отпустит E и в runProgress сработает проверка на зажатую E)
                    .catch((error) => {
                        //преднамеренное прерывание
                        if (error.message === 'Прерывание') {
                            alt.log('Прогресс прерван');
                            // сбрасывает прогрессбар в начальное состояние
                            NotificationSystem.getInstance().progress.update('lockpick', 0, `Прогресс: 0%`);
                            //native.clearPedTasks(alt.Player.local.scriptID);
                            drawNotification('Процесс прерван!');

                        }
                    })
                    //выполняется в любом случае - при успехе или ошибке
                    .finally(() => {
                        native.clearPedTasks(alt.Player.local.scriptID);
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
    
        // создаются обработчики событий
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
        NotificationSystem.getInstance().progress.update('lockpick', percentcounter/10, `Прогресс: ${percentcounter*10}%`);
        //alt.log(`Прогресс: ${percentcounter}/10`);
    
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
    NotificationSystem.getInstance().progress.show('lockpick', 1, `Прогресс: 100%`);
    alt.log('runProgress завершил цикл - ВЗЛОМ УСПЕШЕН!');

    // задержка что бы игрок успел увидеть 100%
    await wait(500);
    }

    singleTap(notifId) {
    if (this.keyPressHandler) {
        alt.off('keydown', this.keyPressHandler);
        alt.log('Удален обработчик singleTap');
    }

    this.keyPressHandler = async (key) => {
        if (key !== 69) return; // E-клавиша
        if (!this.canProcessKeyPress(key)) return;
        if (!NotificationSystem.getInstance().isReady) return;

        this.cleanup();

        // проигрываем анимацию покупки в автомате
        await this.playVendingMachineAnimation();

        drawNotification('Задача выполнена!');
    };

    alt.on('keydown', this.keyPressHandler);
    alt.log('Создан обработчик нажатия Е');
    }

    multipleTaps(requiredTaps){
        
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик multipleTaps')
        }

        let pressDownCounter = 1;
        // cоздает новый обработчик для клавиши E
        this.keyPressHandler = async  (key) => {
            //проверка на нажатие E и соблюдение всех необходимых условий для погрузки (если все условия соблюдены появляется WebView поэтому проверка на WebView) (можно добавить еще проверки на разрешенную модель авто если надо для защиты)
            if ((key === 69) && (NotificationSystem.getInstance().isReady)) {
                
                //дебаунс от спама
                if (!this.canProcessKeyPress(key)) {
                 return;
                }
                
                // удаляет обработчик после нажатия
                //this.cleanup();
                NotificationSystem.getInstance().tapCounter.update('exercise', pressDownCounter, `Осталось: ${requiredTaps-pressDownCounter} раз`);
                //NotificationSystem.getInstance().hidePersistent();   //скрыть WebView
                //   return;
                native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_push_ups@male@base' , 'base', 8.0, -8.0, -1, 1, 0, false, false, false);
                await wait(1000);
                native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_push_ups@male@idle_a' , 'idle_a', 8.0, -8.0, -1, 1, 0, false, false, false);

                alt.log(`Нажали Е, i = ${pressDownCounter}`);

                if (pressDownCounter===requiredTaps){
                    this.cleanup();
                    native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_push_ups@male@exit' , 'exit', 8.0, -8.0, -1, 0, 0, false, false, false);
                    /*
                    NotificationSystem.getInstance().hideTapCounter('exercise');
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
        native.clearPedTasks(alt.Player.local.scriptID);
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
        const notificationManager = NotificationSystem.getInstance();

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

// Анимация взаимодействия с автоматом
async playVendingMachineAnimation() {
    alt.log('Запуск анимации покупки из автомата');

    const player = alt.Player.local;
    const ped = player.scriptID;

    // позиция игрока перед автоматом
    const posX = -1269.3890380859375;
    const posY = -1428.19775390625;
    const posZ = 4.3421630859375;
    const rotZ = -51.023;

    //const currentRot = native.getEntityRotation(player, 2);
    const rotX = 0;
    const rotY = 0;

    // Перемещаем игрока и задаём новую ориентацию
    native.freezeEntityPosition(player, true);
    native.setEntityCoordsNoOffset(player, posX, posY, posZ, false, false, false);
    native.setEntityRotation(player, rotX, rotY, rotZ, 2, true);

    // пауза для корректного позиционирования
    await wait(300);

    try {
        const animDict = 'mini@sprunk';
        const animUse = 'plyr_buy_drink_pt1';
        const animDrink = 'plyr_buy_drink_pt2';
        
        native.taskPlayAnim(ped, animDict, animUse, 8.0, -8.0, -1, 0, 0, false, false, false);
        //await new Promise(resolve => alt.setTimeout(resolve, 2200));
        await wait(2200);
        
        const drinkCan = await this.spawnProp('ng_proc_sodacan_01a');   //спавнит и приклеивает проп к руке
        
        native.taskPlayAnim(ped, animDict, animDrink, 8.0, -8.0, -1, 0, 0, false, false, false);
        //await new Promise(resolve => alt.setTimeout(resolve, 1800));
        await wait(1800);
        this.deleteProp(drinkCan);

    }
    finally {
        native.clearPedTasks(ped);
        native.freezeEntityPosition(player, false);
        alt.log('Анимация покупки завершена');
    }
}

// спавн пропа перед началом анимации
async spawnProp(modelName) {
    //const player = alt.Player.local;
    const ped = alt.Player.local.scriptID;
    //const modelName = 'ng_proc_sodacan_01a';    //prop_ld_can_01  либо  ng_proc_sodacan_01a
    const modelHash = alt.hash(modelName);  //144995201

    // загружает проп
    if (!native.hasModelLoaded(modelHash)) {
        native.requestModel(modelHash);
        let counter = 0;
        while (!native.hasModelLoaded(modelHash) && counter < 100) {
            await wait(20);
            counter++;
        }
        if (!native.hasModelLoaded(modelHash)) {
            alt.log(`spawnProp: не удалось загрузить модель ${modelName}`);
            return null;
        }
    }

    // получает позицию игрока и создаёт объект рядом с ним
    const pos = native.getEntityCoords(ped, true);
    alt.log(`getEntityCoords pos: ${pos}`);
    const object = native.createObject(modelHash, pos.x, pos.y, pos.z, true, true, false);

    // индекс кости правой руки (57005)
    const boneIndex = 71;

    // смещения/повороты под анимацию
/*
//для prop_ld_can_01
const offsetX = 0.10;
const offsetY = 0.02;
const offsetZ = -0.01;

const rotX = 85.0;
const rotY = 0.0;
const rotZ = 180.0;
*/
    // для ng_proc_sodacan_01a
    // смещения/повороты под анимацию
    const offsetX = 0.12; 
    const offsetY = -0.07; 
    const offsetZ = -0.07;

    const rotX = -70.0;
    const rotY = 0.0;
    const rotZ = 0.0;
    // остальные параметры для attachEntityToEntity
    const p9 = false;           // false обычный attach
    const useSoftPinning = true;// мягкое прикрепление
    const collision = false;    // учитывать коллизии
    const isPed = true;         // объект прикреплён к педу
    const vertexIndex = 0;      // индекс вершины
    const fixedRot = true;      // фиксировать вращение
    const p15 = 0;              // вроде как разеревный параметр который ничего не делает


    alt.log(`attachEntityToEntity args:
        modelHash=${modelHash}, object=${object}, ped=${ped}, boneIndex=${boneIndex},
        offs=${offsetX},${offsetY},${offsetZ}, rot=${rotX},${rotY},${rotZ},
        p9=${p9}, soft=${useSoftPinning}, coll=${collision}, isPed=${isPed}, vertex=${vertexIndex}, fixedRot=${fixedRot}, extra=${p15}`);

    // приклеивает проп к правой руке
    native.attachEntityToEntity(
        object,
        ped,
        boneIndex,
        offsetX,
        offsetY,
        offsetZ,
        rotX,
        rotY,
        rotZ,
        p9,
        useSoftPinning, 
        collision,
        isPed,
        vertexIndex,
        fixedRot,
        p15
    );

    return object;
}


deleteProp(object) {
    if (!object) return;
    if (native.doesEntityExist(object)) {
        native.deleteEntity(object);
    }
}


// метод для загрузки словаря анимаций
async loadAnimDict(dict) {

    if (native.hasAnimDictLoaded(dict)) {
        return true;
    }

    native.requestAnimDict(dict);

    let counter = 0;
    while (!native.hasAnimDictLoaded(dict) && counter < 10) {
        alt.log(`Поптыка загрузить анимацию ${dict} номер: ${counter+1}`);
        await wait(200);
        counter++;
    }
    if (!native.hasAnimDictLoaded(dict)) {
        alt.log(`Не удалось загрузить анимацию:${dict}`);
        return false;
    }

    /*
    for (let counter = 1; counter <= 10; counter++) {
        alt.log(`Поптыка загрузить анимацию номер: ${counter}`);
        await new Promise(resolve => alt.setTimeout(resolve, 200));
        if (native.hasAnimDictLoaded(dict)){
            alt.log('AnimDictLoaded загрузилась анимация');
            return;
        }
    }
    alt.log(`Не удалось загрузить анимацию:${dict}`);
    */
}

}

new Interaction();