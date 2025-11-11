// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';

class Interaction {
    constructor() {
        this.vehicleCreated = false;    //для проверки от создания доп машин
        this.init();
    }

    init(){
        alt.on('playerConnect', async (player) => {
            this.demonstrationScene(player);   //подготовка сцены с демонстрацией
            await new Promise(resolve => alt.setTimeout(resolve, 3000));
        //    this.configManager.sendConfigToPlayer(player);
            //alt.emitClient(player, 'client:showNotification');
        });
    }
    //подготовка сцены с демонстрацией
    demonstrationScene(player){
        
        player.spawn(-1271.63, -1430.71, 4.34);
        if (this.vehicleCreated === false) {    //что бы не спавнить на тех же координатах доп машины при перезаходе или входе других игроков
            new alt.Vehicle('benson', -1275.78, -1434.56, 4.54, 0, 0, 0.56621);
            this.vehicleCreated = true;
        }
        alt.emitClient(player, 'client:sceneDemo'); //подготовка сцены с демонстрацией c клиентской стороны
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