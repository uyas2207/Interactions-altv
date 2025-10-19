// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';

class Interaction {
    constructor() {
        this.keyPressHandler = null; // свойство для хранения обработчика

        this.init();
    }

    init(){
        alt.on('playerConnect', async (player) => {
            await new Promise(resolve => alt.setTimeout(resolve, 3000));
        //    this.configManager.sendConfigToPlayer(player);
            alt.emitClient(player, 'client:showNotification');
        });
    }
    //обязательные для реализации методы
    //начало взаимодействия
    startInteraction() {

    }
    //окончание взаимодействия 
    stopInteraction() {
       
    }
    //обновление состояния
    updateInteraction() {
       
    }
    //текст подсказки
    getInteractionText() {

    }

   
}

new Interaction();