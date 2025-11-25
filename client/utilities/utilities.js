import * as alt from 'alt-client';
import * as native from "natives";

export function wait(ms){
    return new Promise(resolve => alt.setTimeout(resolve, ms));
}

//для вызова уведомлений со стороны сервера
//alt.onServer('drawNotification', drawNotification);

//вызов гташных уведмолени с помощью нативок 
export function drawNotification(message, autoHide = true) {
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