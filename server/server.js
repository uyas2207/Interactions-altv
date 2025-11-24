
// alt:V built-in module that provides server-side API.
import * as alt from 'alt-server';
// Your chat resource module.
import * as chat from 'alt:chat';

import { InteractionType } from '../client/Consts.js';

class InteractionServer {
    constructor() {
        this.playerInteractions = new Map();
        this.init();
    }

    init() {
        alt.on('playerConnect', async (player) => {
            this.initializePlayer(player);
            this.demonstrationScene(player);

            await new Promise(resolve => alt.setTimeout(resolve, 3000));
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
    }

    // Создание записи о игроке
    initializePlayer(player) {
        //в случае перезахода не перезаписываются данные игрока (запоминает что уже было выполнено ранее)
        if (this.playerInteractions.has(player.id)) {
            return;
        }
        this.playerInteractions.set(player.id, {
            active: new Set([InteractionType.VEHICLE, InteractionType.EXERCISE, InteractionType.VENDING]),
            completed: new Set()
        });

        alt.log(`[Interaction] Игрок ${player.id} добавлен в таблицу`);
        this.playerInteractions.forEach((value, key) => {
            alt.log(`[Interaction] Игрок ${key}:`);
            alt.log(`  active: ${Array.from(value.active).join(', ')}`);
            alt.log(`  completed: ${Array.from(value.completed).join(', ')}`);
        });
    }

    // При входе — подготовка сцены
    demonstrationScene(player) {
        player.spawn(-1271.63, -1430.71, 4.34);

        if (!this.vehicleCreated) {
            new alt.Vehicle('benson', -1275.78, -1434.56, 4.54, 0, 0, 0.56621);
            this.vehicleCreated = true;
        }
        
        const activeInteractions = Array.from(this.playerInteractions.get(player.id).active);
        alt.log(`[Interaction] activeInteractions ${activeInteractions}`);
        // отправляем список доступных типов
        //alt.emitClient(player, 'client:sceneDemo', Array.from(this.playerInteractions.get(player.id).active));
        alt.emitClient(player, 'client:sceneDemo', activeInteractions );
    }

    completeInteraction(player, type) {
        const data = this.playerInteractions.get(player.id);
        if (!data) return;

        // удаляем из активных
        data.active.delete(type);

        // добавляем в выполненные
        data.completed.add(type);

        alt.log(`[Interaction] Игрок ${player.id} успешно завершил интеракцию (${type})`);
        this.playerInteractions.forEach((value, key) => {
            alt.log(`[Interaction] Игрок ${key}:`);
            alt.log(`  active: ${Array.from(value.active).join(', ')}`);
            alt.log(`  completed: ${Array.from(value.completed).join(', ')}`);
        });
        // уведомление в чате игроку
        chat.send(player, `Успех! Вы завершили интеракцию: ${type}`);
    }

    getPlayerInteraction(player) {
        return this.playerInteractions.get(player.id);
    }
}

new InteractionServer();
