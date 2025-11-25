import { NotificationBase } from './NotificationBase.js';

// класс для уведомлений счетчиков нажатий
export class TapCounter extends NotificationBase {
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