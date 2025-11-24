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

// основной менеджер
class NotificationManager {

    static instance = null;

    static getInstance() {
        if (!this.instance) {   // если экземпляр не существует создает его
            alt.log('instance создан в первый раз:');
            this.instance = new NotificationManager();
        }
        //alt.log('Передан instance:');
        //alt.log(`this.instance: ${JSON.stringify(this.instance, null, '\t')}`);
        // возвращает существующий или только что созданный экземпляр
        return this.instance;
        
    }

    constructor() {
        // защита от потворного вызова constructor
        if (NotificationManager.instance) {
            alt.log('Повторный вызов constructor NotificationManager');
            return NotificationManager.instance;
        }
    
        this.webView = null;       // сслыка на место хранения webview
        this.isInitialized = false; // для защиты от вызова webview до инициализации
        this.isWebViewOpen = false; // для проверки показывается ли в текущий момент webview (в теории можно убрать и проверять через this.activeNotifications.size)
        this.activeNotifications = new Map();   //хранит список всех активных webview

        NotificationManager.instance = this;
    }

    async initialize() {
        // защита от повторной инициализации
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
        //попытка инициализации, если не инициализируется за 2 секунды будет isLoaded false
        const loadPromise = new Promise((resolve) => {
            resolveLoad = () => {
                if (!isResolved) {  //защита от повторого завершения промиса для Promise.race
                    isResolved = true;
                    resolve(true);
                }
            };
        });

        const timeoutPromise = new Promise((resolve) => {
            resolveTimeout = () => {
                if (!isResolved) {  //защита от повторого завершения промиса для Promise.race
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
        const progressBar = new ProgressBar(this, id, title, progress, text);    // создает ProgressBar с переданными параметрами
        progressBar.show(); 
        return progressBar; //возвращает ProgressBar для запоминаяния в классе Interaction
    }

    createTapCounter(id, title, currentTaps = 0, requiredTaps = 0, text = "") {
        const tapCounter = new TapCounter(this, id, title, currentTaps, requiredTaps, text);    // создает TapCounter с переданными параметрами
        tapCounter.show();
        return tapCounter;  //возвращает TapCounter для запоминаяния в класс Interaction
    }

    // общий метод для isWebViewOpen = false;
    updateWebViewState() {
        if (this.activeNotifications.size === 0) {
            this.isWebViewOpen = false;
            alt.log('updateWebViewState сделал isWebViewOpen = false;');
        }
    }
}

// базовый класс шаблон для наследования
class NotificationBase {
    constructor(manager, id) {
        // сохраняет ссылку на менеджер для доступа к общему состоянию
        this.manager = manager;
        this.id = id;
        // для хранения данных уведомления
        this.data = {};
    }

    show(eventName, args) {
        // отправляет событие в webview с id уведомления и аргументами
        this.manager.webView.emit(eventName, this.id, args[0], args[1], args[2], args[3]);
        
        // сохраняет уведомление в списке активных уведомлений
        this.manager.activeNotifications.set(this.id, {
            type: this.type, // тип уведомления (persistent, progress, tapCounter)
            title: this.data.title, // заголовок уведомления
            text: this.data.text, // текст уведомления
            progress: this.data.progress, // значение прогресса (для ProgressBar)
            currentTaps: this.data.currentTaps, // количество нажатий (для TapCounter)
            requiredTaps: this.data.requiredTaps // количество нажатий (для TapCounter)
        });
        
        this.manager.isWebViewOpen = true;
    }

    update(eventName, args) {
        this.manager.webView.emit(eventName, this.id, args[0], args[1], args[2]);
    }

    hide(eventName) {
        this.manager.webView.emit(eventName, this.id);
        
        // удаляет уведомление из списка активных уведомлений
        this.manager.activeNotifications.delete(this.id);
        
        // делает isWebViewOpen = false;
        this.manager.updateWebViewState();
    }
}
// класс для стандартных уведомлений с текстом 
class PersistentNotification extends NotificationBase {
    constructor(manager, id, title, text) {
        // вызов конструктора базового класса
        super(manager, id);
        // тип уведомления для идентификации
        this.type = "persistent";
        // инциализация данных для стандартного уведомления
        this.data = { title: title, text: text };
    }

    show() {
        // защита от использования webview до инициализации 
        if (!this.manager.isInitialized) return;
        // вызов метода базового класса для show
        super.show("showPersistentNotification", [this.data.title, this.data.text]);
    }

    update(title, text) {
        // защита от использования webview до инициализации 
        if (!this.manager.isInitialized) return;

        // обновляет заголовок и текст уведомления если передан новый
        if (title !== undefined) {this.data.title = title}
        if (text !== undefined) {this.data.text = text}

        // вызов метода базового класса с обновленными данными
        super.update("updatePersistentNotification", [this.data.title, this.data.text]);
    }

    hide() {
        // защита от использования webview до инициализации 
        if (!this.manager.isInitialized) return;
        // вызов метода базового класса для скрытия
        super.hide("hidePersistentNotification");
    }
}

// класс для уведомлений с прогресс-баром
class ProgressBar extends NotificationBase {
    constructor(manager, id, title, initialProgress, text) {
        // вызов конструктора базового класса
        super(manager, id);
        // тип уведомления для идентификации
        this.type = "progress";
        // инциализация данных для прогресс-бара
        this.data = { 
            title: title, // заголовок прогресс-бара
            progress: initialProgress || 0, // начальное значение прогресса (по умолчанию 0)
            text: text // текст под прогресс-баром
        };
    }

    show() {
        // защита от использования webview до инициализации
        if (!this.manager.isInitialized) return;
        // вызов метода базового класса с данными прогресс-бара
        super.show("showProgressBar", [this.data.title, this.data.progress, this.data.text]);
    }

    update(progress, text) {
        // защита от использования webview до инициализации 
        if (!this.manager.isInitialized) return;

        // обновление значения прогресса
        this.data.progress = progress;
        // обновляет текст если передан новый
        if (text !== undefined) this.data.text = text;

        // вызов метода базового класса с обновленными данными прогресса
        super.update("updateProgressBar", [this.data.progress, this.data.text]);
    }

    hide() {
        // защита от использования webview до инициализации 
        if (!this.manager.isInitialized) return;
        // вызов метода базового класса для скрытия ProgressBar
        super.hide("hideProgressBar");
    }
}

// класс для уведомлений счетчиков нажатий
class TapCounter extends NotificationBase {
    constructor(manager, id, title, currentTaps, requiredTaps, text) {
        // вызов конструктора базового класса
        super(manager, id);
        // тип уведомления для идентификации
        this.type = "tapCounter";
        // инициализирует данные счетчика нажатий
        this.data = { 
            title: title, 
            currentTaps: currentTaps,
            requiredTaps: requiredTaps,
            text: text
        };
    }

    show() {
        // защита от использования webview до инициализации
        if (!this.manager.isInitialized) return;
        // вызов метода базового класса с данными счетчика
        super.show("showTapCounter", [this.data.title, this.data.currentTaps, this.data.requiredTaps, this.data.text]);
    }

    update(currentTaps, text) {
        // защита от использования webview до инициализации
        if (!this.manager.isInitialized) return;

        this.data.currentTaps = currentTaps;
        if (text !== undefined) this.data.text = text;

        //вызов метода базового класса с обновленными данными счетчика
        super.update("updateTapCounter", [this.data.currentTaps, this.data.text]);
    }

    hide() {
        // защита от использования webview до инициализации 
        if (!this.manager.isInitialized) return;
        //вызов метода базового класса для скрытия счетчика
        super.hide("hideTapCounter");
    }
}
// класс для создания и уничтожения визуальных элементов точки и колшейпов
class PointVisuals {
    constructor(position, config = {}) {
        this.position = position;
        this.config = config;
    }

    create() {
        const marker = new alt.Marker(
            this.config.markerType, 
            this.position, 
            this.config.color
        );
        marker.scale = this.config.scale;

        const colshape = new alt.ColshapeSphere(
            this.position.x, 
            this.position.y, 
            this.position.z + (this.config.heightOffset), 
            this.config.radius
        );

        return { marker, colshape };
    }
}

class Interaction {
    constructor() {
        this.currentInteraction = null;
        this.activeInteractions = null;
        this.colshapes = [];    // массив существующих колшейпов
        this.markers = [];      // массив существующих маркеров

        this.interactionPoints = [
            {   //данные точки для взлома машины
                position: new alt.Vector3(-1275.08, -1431.94, 3.47),
                config: {
                    interactionType: InteractionType.VEHICLE,
                    color: new alt.RGBA(241, 196, 15),
                    scale: new alt.Vector3(1.5, 1.5, 1.5),
                    markerType: 1,
                    heightOffset: 1,    // + по координате z
                    radius: 1
                }
            },
            {   //данные точки для упражнений
                position: new alt.Vector3(-1273.76, -1427.74, 3.34),
                config: {
                    interactionType: InteractionType.EXERCISE,
                    color: new alt.RGBA(46, 204, 113),
                    scale: new alt.Vector3(1.5, 1.5, 1.5),
                    markerType: 1,
                    heightOffset: 1,    // + по координате z
                    radius: 1
                }
            },
            {   //данные точки для автомата с колой
                position: new alt.Vector3(-1269.45, -1428.14, 3.34),
                config: {
                    interactionType: InteractionType.VENDING,
                    color: new alt.RGBA(52, 152, 219),
                    scale: new alt.Vector3(1.5, 1.5, 1.5),
                    markerType: 1,
                    heightOffset: 1,
                    radius: 1
                }
            }
        ];

        this.init();
    }

    async init() {
        this.initializeNotificationManager();

        alt.onServer('client:sceneDemo', async (activeInteractions) => {
            this.spawnPoints(activeInteractions);     //создание колшейпов и маркеров
            await this.preloadAnims();  //предзагрузка всех необходимых анимаций 
        });

        alt.on('entityEnterColshape', (colshape, entity) => this.onEnter(colshape, entity));
        alt.on('entityLeaveColshape', (colshape, entity) => this.onLeave(colshape, entity));
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

    //предзагрузка всех необходимых анимаций 
    async preloadAnims() {
        // последовательная загрузка необходимых анимаций
        await AnimationManager.loadAnimDict('mini@sprunk');
        await AnimationManager.loadAnimDict('amb@world_human_push_ups@male@base');
        await AnimationManager.loadAnimDict('amb@world_human_push_ups@male@idle_a');
        await AnimationManager.loadAnimDict('amb@world_human_push_ups@male@exit');
        await AnimationManager.loadAnimDict('amb@world_human_stand_mobile@male@text@base');
    }

    spawnPoints(activeInteractions) {
        //alt.log(`activeInteractions ${activeInteractions}`)
        this.interactionPoints.forEach((point, index) => {
            if (activeInteractions.includes(point.config.interactionType)){
            const visuals = new PointVisuals(point.position, point.config).create();
        
            // добавление дополнительных свойств для колшейпов
            visuals.colshape.interactionType = point.config.interactionType;
            visuals.colshape.pointIndex = index; // для идентификации точки
        
            // добавление данных созданной точки в массивы
            this.markers.push(visuals.marker);
            this.colshapes.push(visuals.colshape);
            }
        });
        alt.log(`Создано маркеров: ${this.markers.length}`);
        alt.log(`Создано колшейпов: ${this.colshapes.length}`);
        alt.log(`Массив колшейпов:`, this.colshapes);
    }
    //метод который вызывается при входе в колшейп
    onEnter(colshape, entity) {
        alt.log('Игрок вошел в колшейп');
        if (!(entity instanceof alt.Player)) return;
        if (!colshape.interactionType) return;  //если в будущем будут добавлены другие колшейпы

        this.currentInteraction = this.createInteraction(colshape.interactionType, colshape.index); //запоминает и создает webview уведмоления в зависимости от типа колшейпа в который вошел игрок
        this.currentInteraction.startInteraction(); //вызов логики для конкретного типа взаимодействия
    }
    //метод который вызывается при выходе из колшейпа
    onLeave(colshape, entity) {
        if (!(entity instanceof alt.Player)) return;
        if (!this.currentInteraction) return;   //если в будущем будут добавлены другие колшейпы

        this.currentInteraction.stopInteraction();  //вызов логики отмены для конкретного типа взаимодействия
        this.currentInteraction = null; 
    }
    //создает webview уведмоления в зависимости от типа колшейпа в который вошел игрок
    createInteraction(type, index) {
        const pointData = this.interactionPoints[index];
        switch (type) {
            case InteractionType.VEHICLE: return new HoldInteraction(pointData);
            case InteractionType.EXERCISE: return new MultiTapInteraction(pointData);
            case InteractionType.VENDING: return new SingleTapInteraction(pointData);
        }
    }
}

//Шаблон для классов наследников
class InteractionBase {
    constructor(pointData) {
        this.point = pointData;
        this.keyEDebounceMs = 1500; // задержка между нажатиями
        this.lastKeyEPressTime = 0;
    }

    startInteraction() {}
    stopInteraction() {}
    updateInteraction() {}
    getInteractionText() { return ""; }
    
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
    
}

class SingleTapInteraction extends InteractionBase {
    startInteraction() {
        this.notif = new PersistentNotification(NotificationManager.getInstance(), 'vending','Торговый автомат', 'Нажмите E чтобы купить напиток');     //создает и запоминает webview уведомление для 1 нажатия
        this.notif.show();

        this.handler = async (key) => {
            if ((key !== 69)) return;
            this.stopInteraction();
            await AnimationManager.playVendingMachineAnimation();   // запуск анимации покупки в автомате
            drawNotification('Задача выполнена!');
            alt.emitServer('client:succesSingleTapInteraction');   //передача на сервер информации об успешном завршении интракции
        };

        alt.on('keydown', this.handler);
        alt.log('Создан обработчик нажатия Е');
    }

    stopInteraction() {
        //native.clearPedTasks(alt.Player.local.scriptID);

        //проверки нужны на случай успешного выполнения и последущего выхода из колшейпа (полсле выполнения все удаляется, после выхода происходит повторная попытка удаления)
        if (this.handler) {
            alt.off('keydown', this.handler);
            this.handler = null;
            alt.log('Обработчик keydown удален');
        }

        if (this.notif) {
            this.notif.hide();
            this.notif = null;
        }
    }

    getInteractionText() { return "Нажмите E"; }
}

class MultiTapInteraction extends InteractionBase {
    constructor(pointData) {
        super(pointData);
        this.required = 10;
        this.counter = 0;
    }

    startInteraction() {
        //отображение уведмоления
        this.multipleTaps = NotificationManager.getInstance().createTapCounter('exercise', 'Отжимания', 0, this.required, 'Быстро нажимайте E!');
        //логика при нажатии на кнопку
        this.handler = async (key) => {
            if (key !== 69) return; //игнорирует все кнопки кроме E
            //дебаунс от спама
            if (!super.canProcessKeyPress(key)) {
                return;
            }

            this.counter++;
            this.updateInteraction();   //метод для изменения текста уведомления
            //анимация 1 отжимания (так как за 1 секунду делается только 1 отжимание)
            native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_push_ups@male@base' , 'base', 8.0, -8.0, -1, 1, 0, false, false, false);
            await wait(1000);
            //анимация ожидания следующего отжимания (следущего нажатия E)
            native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_push_ups@male@idle_a' , 'idle_a', 8.0, -8.0, -1, 1, 0, false, false, false);

            if (this.counter === this.required) {
                this.stopInteraction();
                native.taskPlayAnim( alt.Player.local.scriptID,'amb@world_human_push_ups@male@exit','exit',8.0,-8.0,-1,0,0,false,false,false );
                drawNotification('Задача выполнена!');
                alt.emitServer('client:succesMultiTapInteraction'); //передача на сервер информации об успешном завршении интракции
            }
        };
        // регистрирует обработчик
        alt.on('keydown', this.handler);
        alt.log('Создан обработчик нажатия Е')
    }

    //метод для изменения текста уведомления
    updateInteraction() {
        this.multipleTaps.update(this.counter, `Осталось: ${this.required - this.counter} раз`);
    }

    stopInteraction() {
        //проверки нужны на случай успешного выполнения и последущего выхода из колшейпа (полсле выполнения все удаляется, после выхода происходит повторная попытка удаления)
        if (this.handler) {
            alt.off('keydown', this.handler);
            this.handler = null;
            alt.log('Обработчик keydown удален');
        }

        if (this.multipleTaps) {
            this.multipleTaps.hide();
            this.multipleTaps = null;
        }
    }

    getInteractionText() { return "Быстро нажимайте E!"; }
}

class HoldInteraction extends InteractionBase {
    constructor(pointData) {
        super(pointData);
        this.isKeyHeld = false;
        this.progressPromise = null;
        this.controller = null;
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
   async startInteraction(){      
        this.bar = NotificationManager.getInstance().createProgressBar('lockpick', 'Взлом замка', 0, "");

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
            
            //устанавливает флаг что клавиша E нажата
            this.isKeyEHeld = true;
            
            //проверка на уже запущенный прогресс
            //если уже выполняется другой процесс прогресса, отменяем его (таких ситуаций не бывает в коде)
/*
            if (this.currentProgressPromise) {
                alt.log('Прогресс уже выполняется, отменяем предыдущий');
                // устанавливает флаг прерывания для текущего прогресса
                this.cancelProgress();
                // ожиадние завершения предыдущего промиса (асинхронная отмена)
                try {
                    // ожиадние завершения предыдущего прогресса, игнорируя ошибки
                    await this.currentProgressPromise.catch(() => {});
                    alt.log('Предыдущий прогресс завершен');
                } catch (error) {
                    alt.log(`Ошибка при ожидании предыдущего прогресса: ${error.message}`);
                }
            }
*/            
            //проверка, что WebView открыт и готов к отображению прогресса
            if (NotificationManager.getInstance().isWebViewOpen) {
                //устанавливает флаг что процесс выполняется
                this.inProgress = true;
                //создаем новый контроллер прогресса с флагом остановки
                this.progressController = { shouldStop: false };
                
                alt.log('Запуск нового прогресса...');
                //анимация для взлома
                native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_stand_mobile@male@text@base' , 'base', 8.0, -8.0, -1, 49, 0, false, false, false);
                //создает и сохраняет Promise для отслеживания выполнения runProgress
                this.currentProgressPromise = this.runProgress()
                    //обработка успешного завершения прогресса
                    .then(() => {
                        alt.log('Прогресс завершен успешно');
                        drawNotification('Задача выполнена!');
                        alt.emitServer('client:succesHoldInteraction');    //передача на сервер информации об успешном завршении интракции
                        // очистка, закрытие Webview
                        this.stopInteraction();
                    })
                    //способ прервать выполнение прогресса(происходит после того как игрок отпустит E и в runProgress сработает проверка на зажатую E)
                    .catch((error) => {
                        //преднамеренное прерывание
                        if (error.message === 'Прерывание') {
                            alt.log('Прогресс прерван');
                            // сбрасывает прогрессбар в начальное состояние
                            this.updateInteraction(0);  //метод для изменения текста уведомления
                            //отменяет текущую анимацю (при остановке прогресса и при успешном завершении)
                            native.clearPedTasks(alt.Player.local.scriptID);
                            drawNotification('Процесс прерван!');

                        }
                    })
                    //выполняется в любом случае - при успехе или ошибке
                    .finally(() => {

                        // сбрасывает ссылку на Promise чтобы разрешить новый запуск
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
        //this.currentProgressBar.update( percentcounter / 10, `Прогресс: ${percentcounter * 10}%`);
        
        this.updateInteraction(percentcounter);

        // ожидание 1 секунды с возможностью прерывания и очисткой обработчиков timeout и interval
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
                // Игрок отпустил клавишу -> Была запрошена остановка (shouldStop)
                if (this.progressController.shouldStop) {
                    safeReject(new Error('Прерывание'));
                    alt.log(`Шаг ${percentcounter} прерван`);
                }
            }, 200); // проверяет каждые 200 миллисекунд
        });
    }
    
    // финальное отображение после того как прогрессбар дошел до конца
    this.inProgress = false;
    //this.currentProgressBar.update(1, `Прогресс: 100%`);
    alt.log('runProgress завершил цикл - ВЗЛОМ УСПЕШЕН!');

    // задержка что бы игрок успел увидеть 100%
    await wait(500);
    }


    stopInteraction() {
        native.clearPedTasks(alt.Player.local.scriptID);

        //проверки нужны на случай успешного выполнения и последущего выхода из колшейпа (полсле выполнения все удаляется, после выхода происходит повторная попытка удаления)
        if (this.keyPressHandler) {
            alt.off('keydown', this.keyPressHandler);
            alt.log('Удален обработчик keyPressHandler stopInteraction')
        }
        
        if (this.keyUpHandler) {
            alt.off('keyup', this.keyUpHandler);
            alt.log('Удален обработчик keyup stopInteraction')
        }
        // вызывает метод, который установит флаг shouldStop для остановки runProgress
        this.cancelProgress();
        
        if (this.bar){
            this.bar.hide();
        }
        //this.progressPromise = null;
    }

//метод для изменения текста уведомления
    updateInteraction(i) {
        this.bar.update(i/10, `Прогресс: ${i*10}%`);
    }

    getInteractionText() { return "Удерживайте E"; }
}

class AnimationManager {
    static config = {
        // Настройки для спавна пропов
        propSettings: {
            boneIndex: 71, // индекс кости правой руки
            // настройки для разных моделей пропов
            modelOffsets: {
                'ng_proc_sodacan_01a': {
                    offsetX: 0.12,
                    offsetY: -0.07,
                    offsetZ: -0.07,
                    rotX: -70.0,
                    rotY: 0.0,
                    rotZ: 0.0
                }
            },
            // общие настройки для attachEntityToEntity
            attachSettings: {
                p9: false,              // false обычный attach
                useSoftPinning: true,   // мягкое прикрепление
                collision: false,       // учитывать коллизии
                isPed: true,            // объект прикреплён к педу
                vertexIndex: 0,         // индекс вершины
                fixedRot: true,         // фиксировать вращение
                p15: 0                  // вроде как разеревный параметр который ничего не делает
            }
        },
        
        // настройки для анимации торгового автомата
        vendingMachine: {
            position: {
                x: -1269.3890380859375,
                y: -1428.19775390625,
                z: 4.3421630859375,
                rotZ: -51.023
            },
            animations: {
                dict: 'mini@sprunk',
                use: 'plyr_buy_drink_pt1',
                drink: 'plyr_buy_drink_pt2'
            }
        }
    };

    // метод для загрузки словаря анимаций
    static async loadAnimDict(dict) {
        //если анимация уже есть 
        if (native.hasAnimDictLoaded(dict)) {
            return true;
        }

        native.requestAnimDict(dict);

        let counter = 0;
        while (!native.hasAnimDictLoaded(dict) && counter < 100) {
            alt.log(`Поптыка загрузить анимацию ${dict} номер: ${counter+1}`);
            await wait(200);
            counter++;
        }
        if (!native.hasAnimDictLoaded(dict)) {
            alt.log(`Не удалось загрузить анимацию:${dict}`);
            return false;
        }
    }

    // спавн пропа перед началом анимации
    static async spawnProp(modelName) {
        const ped = alt.Player.local.scriptID;
        const modelHash = alt.hash(modelName);

        // загружает проп
        if (!native.hasModelLoaded(modelHash)) {
            native.requestModel(modelHash);
            let counter = 0;
            while (!native.hasModelLoaded(modelHash) && counter < 100) {
                await wait(20);
                counter++;
            }
            //если не получилось загрузить
            if (!native.hasModelLoaded(modelHash)) {
                alt.log(`spawnProp: не удалось загрузить модель ${modelName}`);
                return null;
            }
        }

        // получает позицию игрока и создаёт объект рядом с ним
        const pos = native.getEntityCoords(ped, true);
        alt.log(`getEntityCoords pos: ${pos}`);
        const object = native.createObject(modelHash, pos.x, pos.y, pos.z, true, true, false);

        // Получаем настройки для конкретной модели
        const modelConfig = this.config.propSettings.modelOffsets[modelName]

        const { offsetX, offsetY, offsetZ, rotX, rotY, rotZ } = modelConfig;
        const attachSettings = this.config.propSettings.attachSettings;

        alt.log(`attachEntityToEntity args:
            modelHash=${modelHash}, object=${object}, ped=${ped}, boneIndex=${this.config.propSettings.boneIndex},
            offs=${offsetX},${offsetY},${offsetZ}, rot=${rotX},${rotY},${rotZ}, p9=${attachSettings.p9}, soft=${attachSettings.useSoftPinning},
            coll=${attachSettings.collision}, isPed=${attachSettings.isPed}, vertex=${attachSettings.vertexIndex}, fixedRot=${attachSettings.fixedRot}, extra=${attachSettings.p15}`);

        // приклеивает проп к правой руке
        native.attachEntityToEntity(
            object,
            ped,
            this.config.propSettings.boneIndex,
            offsetX,
            offsetY,
            offsetZ,
            rotX,
            rotY,
            rotZ,
            attachSettings.p9,
            attachSettings.useSoftPinning, 
            attachSettings.collision,
            attachSettings.isPed,
            attachSettings.vertexIndex,
            attachSettings.fixedRot,
            attachSettings.p15
        );

        return object;
    }

    //удаляет проп после завршения анимации
    static deleteProp(object) {
        if (!object) return;
        if (native.doesEntityExist(object)) {
            native.deleteEntity(object);
        }
    }

    // Анимация взаимодействия с автоматом
    static async playVendingMachineAnimation() {
        alt.log('Запуск анимации покупки из автомата');

        const player = alt.Player.local;
        const ped = player.scriptID;

        const vendingConfig = this.config.vendingMachine;
        const animConfig = vendingConfig.animations;

        // Перемещает игрока и задаёт новую ориентацию
        native.freezeEntityPosition(player, true);
        native.setEntityCoordsNoOffset(player, vendingConfig.position.x, vendingConfig.position.y, vendingConfig.position.z, false, false, false);
        native.setEntityRotation(player, 0, 0, vendingConfig.position.rotZ, 2, true);

        // пауза для корректного позиционирования
        await wait(300);

        try {
            native.taskPlayAnim(ped, animConfig.dict, animConfig.use, 8.0, -8.0, -1, 0, 0, false, false, false);
            await wait(2200);
            
            const drinkCan = await this.spawnProp('ng_proc_sodacan_01a');
            
            native.taskPlayAnim(ped, animConfig.dict, animConfig.drink, 8.0, -8.0, -1, 0, 0, false, false, false);
            await wait(1800);
            AnimationManager.deleteProp(drinkCan);

        }
        finally {
            native.clearPedTasks(ped);
            native.freezeEntityPosition(player, false);
            alt.log('Анимация покупки завершена');
        }
    }
}



new Interaction(); 