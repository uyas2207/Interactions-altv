import * as alt from 'alt-client';
import * as native from "natives";

import { InteractionBase } from './InteractionBase.js';
import { NotificationManager } from '@notifications/NotificationManager.js';
import { intractionConfig } from '@config/IntractionConfig.js';


export class MultiTapInteraction extends InteractionBase {
    constructor(pointData) {
        super(pointData);
        //this.config.required = intractionConfig.multiTapInteraction.required;
        this.counter = 0;
        this.config = intractionConfig.multiTapInteraction;
    }

    startInteraction() {
        //отображение уведмоления
        this.multipleTaps = NotificationManager.getInstance().createTapCounter('exercise', this.config.title, 0, this.config.required, this.config.text);
        //логика при нажатии на кнопку
        this.handler = async (key) => {
            if (key !== intractionConfig.intractionKey) return; //игнорирует все кнопки кроме E
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

            if (this.counter === this.config.required) {
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
        this.multipleTaps.update(this.counter, `Осталось: ${this.config.required - this.counter} раз`);
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