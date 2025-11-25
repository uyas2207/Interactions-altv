import * as alt from 'alt-client';
import * as native from "natives";

import { InteractionBase } from './InteractionBase.js';
import { NotificationManager } from '@notifications/NotificationManager.js';

export class HoldInteraction extends InteractionBase {
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
    //await wait(500);
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