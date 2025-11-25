import { NotificationBase } from './NotificationBase.js';
// класс для уведомлений с прогресс-баром
export class ProgressBar extends NotificationBase {
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