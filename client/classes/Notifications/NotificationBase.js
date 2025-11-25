//import * as alt from 'alt-client';

// базовый класс шаблон для наследования
export class NotificationBase {
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