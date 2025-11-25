import * as alt from 'alt-client';

import { InteractionBase } from './InteractionBase.js';
import { NotificationManager } from '@notifications/NotificationManager.js';
import { AnimationManager } from '@classes/AnimationManager.js';
import { PersistentNotification } from '@notifications/PersistentNotification.js';


export class SingleTapInteraction extends InteractionBase {
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