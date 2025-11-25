import { NotificationBase } from './NotificationBase.js';

// класс для стандартных уведомлений с текстом 
export class PersistentNotification extends NotificationBase {
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