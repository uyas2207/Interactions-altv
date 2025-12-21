// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';

import { InteractionCommands } from './commands/interactionCommands.js';

class InteractionServer {
    constructor() {
        this.playerInteractions = new Map();

        this.init();
    }

    init(){
        alt.on('playerConnect', async (player) => {
            this.initializePlayer(player);
            this.demonstrationScene(player);
        });
       
        alt.onClient('client:succesSingleTapInteraction', (player) => {
            this.completeInteraction(player, InteractionType.VENDING);
        });
                
        alt.onClient('client:succesMultiTapInteraction', (player) => {
            this.completeInteraction(player, InteractionType.EXERCISE);
        });
                
        alt.onClient('client:succesHoldInteraction', (player) => {
            this.completeInteraction(player, InteractionType.VEHICLE);
        });

        alt.onClient('client:checkDistance', (player, interactionType) => {
            this.checkDistance(player, interactionType);
        });
    }

    // создание записи о игроке
    initializePlayer(player) {
        //в случае перезахода не перезаписываются данные игрока (запоминает что уже было выполнено ранее)
        if (this.playerInteractions.has(player.id)) {
            return;
        }
        this.playerInteractions.set(player.id, {
            active: new Set([InteractionType.VEHICLE, InteractionType.EXERCISE, InteractionType.VENDING]),
            completed: new Set()
        });

        alt.log(`[Interactions] Игрок ${player.id} добавлен в таблицу`);
        this.printAllplayersInteractionsState();
    }

    // При входе — подготовка сцены
    demonstrationScene(player) {
        player.spawn(-1271.63, -1430.71, 4.34);

        if (!this.vehicleCreated) {
            new alt.Vehicle('benson', -1275.78, -1434.56, 4.54, 0, 0, 0.56621);
            this.vehicleCreated = true;
        }
        
        const activeInteractions = Array.from(this.playerInteractions.get(player.id).active);
        alt.log(`[Interactions] activeInteractions ${activeInteractions}`);
        // говорит клиенту создать демо сцену только для списка доступных типов (тех которые конкретный игрок еще не выполнил)
        alt.emitClient(player, 'client:sceneDemo', activeInteractions );
    }

    completeInteraction(player, type) {
        const data = this.playerInteractions.get(player.id);
        if (!data) return;

        // удаляет из активных
        data.active.delete(type);

        // добавляем в выполненные
        data.completed.add(type);

        alt.log(`[Interactions] Игрок ${player.id} успешно завершил интеракцию (${type})`);
        this.printAllplayersInteractionsState();
        // уведомление в чате игроку
        chat.send(player, `Успех! Завершена интеракция: ${type}`);
        alt.emitClient(player, 'client:delPoint', type);
    }
    
    //создание точки по команде клиента
    createPoint(player, type){
        const data = this.playerInteractions.get(player.id);
        //проверка если у клиента уже есть актвиная точка такого типа
        if (!data.active.has(type)) {
        alt.emitClient(player, 'client:createPoint', type);

        data.active.add(type);  //Добавить в map игрока новую, только что созданную точку
        data.completed.delete(type);    //удалить из map выполненых точек игрока прошлую точку (так как создана новая)
        this.printAllplayersInteractionsState();
        }
        else{
            chat.send(player, 'Нельзя использовать /create для уже существующей точки');
            chat.send(player, 'Типы интераций: VEHICLE = 1, EXERCISE = 2, VENDING = 3');
        }
    }

    checkDistance(player, interactionType){
        // Получает координаты по типу взаимодействия
        const pointData = pointsCoords[interactionType];
        if (!pointData) {
            alt.log(`[Interactions] Координаты не найдены для типа ${interactionType}`);
            return;
        }
        const pointPos = new alt.Vector3(pointData.x, pointData.y, pointData.z);        
        const distance = player.pos.distanceTo(pointPos);

        if (distance > 3) {
            alt.log(`[Interactions] Игрок ${player.id} слишком далеко от точки. distance: ${distance}> 3`);
            return;
        }
        else{
            alt.log(`[Interactions] Игрок ${player.id} прошел проверку дистанции. distance = ${distance}m`);
            alt.emitClient(player, 'client:checkDistanceSuccess', interactionType);
        }
    }

    //выводит текщее состояние инетрацкий для всех игроков на сервере
    printAllplayersInteractionsState(){
        this.playerInteractions.forEach((value, key) => {
            alt.log(`[Interactions] Игрок ${key}:`);
            alt.log(` active: ${Array.from(value.active).join(', ')}`);
            alt.log(` completed: ${Array.from(value.completed).join(', ')}`);
        });
    }
}

const interactionServer = new InteractionServer();
InteractionCommands.register(interactionServer);