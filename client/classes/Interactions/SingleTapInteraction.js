import * as alt from 'alt-client';

import { InteractionBase } from './InteractionBase.js';
import { NotificationManager } from '@notifications/NotificationManager.js';
import { AnimationManager } from '@classes/AnimationManager.js';
import { PersistentNotification } from '@notifications/PersistentNotification.js';
import { intractionConfig } from '@config/IntractionConfig.js';

export class SingleTapInteraction extends InteractionBase {
    constructor(pointData) {
        super(pointData);
        this.config = intractionConfig.singleTapInteraction;
    }

    startInteraction() {
        this.notif = new PersistentNotification(NotificationManager.getInstance(), 'vending', this.config.title, this.config.text);     //создает и запоминает webview уведомление для 1 нажатия
        this.notif.show();
    }

    async keyPressHandler() {
        if (NotificationManager.getInstance().isWebViewOpen){   //предотвращает повторные вызовы (можно было бы создать новое значение которое бы обозначало что процесс уже запущен либо использовать асинхронность, но у меня и так ее слишком много)
            this.stopInteraction();
            await AnimationManager.playVendingMachineAnimation();   // запуск анимации покупки в автомате
            drawNotification('Задача выполнена');
            alt.emitServer('client:succesSingleTapInteraction');   //передача на сервер информации об успешном завршении интракции
        }
    };

    stopInteraction() {
        if (this.notif) {
            this.notif.hide();
            this.notif = null;
        }
    }

    getInteractionText() { return this.config.text; }
}