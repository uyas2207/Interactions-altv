import * as alt from 'alt-client';
import * as native from "natives";

import { InteractionBase } from './InteractionBase.js';
import { NotificationManager } from '@notifications/NotificationManager.js';
import { intractionConfig } from '@config/IntractionConfig.js';

export class HoldInteraction extends InteractionBase {
    constructor(pointData) {
        super(pointData);

        this.config = intractionConfig.holdInteraction;
        this.currentActiveProgress = null;
    }

    // основной метод для настройки обработки прогресс-бара (долгого зажатия E)
    startInteraction(){
        this.bar = NotificationManager.getInstance().createProgressBar('lockpick', this.config.title, 0, this.config.text);
        this.#updateInteraction(0);
    }

    keyPressHandler(key) {
        //дебаунс от спама - проверяем можно ли обработать это нажатие
        if (!super.canProcessKeyPress(key)) {
            return; // если дебаунс активен, отменяет последующие действия
        }
        // если при нажатии на E уже запущен процесс взлома произойдет return
        if (this.currentActiveProgress !== null){
            return;
        }
        
        //анимация для взлома
        native.taskPlayAnim(alt.Player.local.scriptID, 'amb@world_human_stand_mobile@male@text@base' , 'base', 8.0, -8.0, -1, 49, 0, false, false, false);

        let counter = 0;
        this.currentActiveProgress = alt.setInterval(() => {
            if(counter < 10){
                counter++;
                this.#updateInteraction(counter);
            }
            else{
                drawNotification('Задача выполнена!');
                alt.emitServer('client:succesHoldInteraction');

                alt.clearInterval(this.currentActiveProgress);
                this.currentActiveProgress = null;
            }
        }, 1000);
    };

    // Обработчик отпускания клавиши E
    keyUpHandler(key) {
        if (this.currentActiveProgress !== null) {
            alt.clearInterval(this.currentActiveProgress);
            this.currentActiveProgress = null;

            // сбрасывает прогрессбар в начальное состояние
            this.#updateInteraction(0);  //метод для изменения текста уведомления
            native.clearPedTasks(alt.Player.local.scriptID);
            drawNotification('Процесс прерван!');
        }
    };
    
    stopInteraction() {
        native.clearPedTasks(alt.Player.local.scriptID);
        //проверки нужны на случай успешного выполнения и последущего выхода из колшейпа (полсле выполнения все удаляется, после выхода происходит повторная попытка удаления)
        //флаг shouldStop для остановки runProgress
        if(this.currentActiveProgress !== null){
            alt.clearInterval(this.currentActiveProgress);
            this.currentActiveProgress = null;
        }

        if (this.bar){
            this.bar.hide();
        }
    }

    //метод для изменения текста уведомления
    #updateInteraction(i) {
        this.bar.update(i/10, `Прогресс: ${i*10}%`);
    }

    getInteractionText() { return this.config.text; }
}