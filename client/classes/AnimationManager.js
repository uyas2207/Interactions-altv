import * as alt from 'alt-client';
import * as native from "natives";

import { animationConfig } from '@config/AnimationConfig.js';

export class AnimationManager {

    static config = animationConfig;
    // метод для загрузки словаря анимаций
    static async loadAnimDict(dict) {
        //если анимация уже есть 
        if (native.hasAnimDictLoaded(dict)) {
            return true;
        }

        native.requestAnimDict(dict);
        await wait(800);
        const status = native.hasAnimDictLoaded(dict);
        alt.log(`native.hasAnimDictLoaded(${dict}): ${status}`);
        return status;

/*
        let counter = 0;
        while (!native.hasAnimDictLoaded(dict) && counter < 10) {
            alt.log(`Поптыка загрузить анимацию ${dict} номер: ${counter+1}`);
            await wait(200);
            counter++;
        }
        if (!native.hasAnimDictLoaded(dict)) {
            alt.log(`Не удалось загрузить анимацию:${dict}`);
            return false;
        }
        */
    }

    // спавн пропа перед началом анимации
    static async spawnProp(modelName) {
        const ped = alt.Player.local.scriptID;
        const modelHash = alt.hash(modelName);

        // загружает проп
        if (!native.hasModelLoaded(modelHash)) {
            native.requestModel(modelHash);
            await wait(600);
            /*
            let counter = 0;
            while (!native.hasModelLoaded(modelHash) && counter < 10) {
                await wait(200);
                counter++;
            }
            */
            //если не получилось загрузить
            if (!native.hasModelLoaded(modelHash)) {
                alt.log(`spawnProp: не удалось загрузить модель ${modelName}`);
                return null;
            }
        }

        // получает позицию игрока и создаёт объект рядом с ним
        const pos = native.getEntityCoords(ped, true);
        alt.log(`getEntityCoords pos: ${pos}`);
        const object = native.createObject(modelHash, pos.x, pos.y, pos.z, true, true, false);

        // Получаем настройки для конкретной модели
        const modelConfig = this.config.propSettings.modelOffsets[modelName]

        const { offsetX, offsetY, offsetZ, rotX, rotY, rotZ } = modelConfig;
        const attachSettings = this.config.propSettings.attachSettings;

        alt.log(`attachEntityToEntity args:
            modelHash=${modelHash}, object=${object}, ped=${ped}, boneIndex=${this.config.propSettings.boneIndex},
            offs=${offsetX},${offsetY},${offsetZ}, rot=${rotX},${rotY},${rotZ}, p9=${attachSettings.p9}, soft=${attachSettings.useSoftPinning},
            coll=${attachSettings.collision}, isPed=${attachSettings.isPed}, vertex=${attachSettings.vertexIndex}, fixedRot=${attachSettings.fixedRot}, extra=${attachSettings.p15}`);

        // приклеивает проп к правой руке
        native.attachEntityToEntity(
            object,
            ped,
            this.config.propSettings.boneIndex,
            offsetX,
            offsetY,
            offsetZ,
            rotX,
            rotY,
            rotZ,
            attachSettings.p9,
            attachSettings.useSoftPinning, 
            attachSettings.collision,
            attachSettings.isPed,
            attachSettings.vertexIndex,
            attachSettings.fixedRot,
            attachSettings.p15
        );

        return object;
    }

    //удаляет проп после завршения анимации
    static deleteProp(object) {
        if (!object) return;
        if (native.doesEntityExist(object)) {
            native.deleteEntity(object);
        }
    }

    // Анимация взаимодействия с автоматом
    static async playVendingMachineAnimation() {
        alt.log('Запуск анимации покупки из автомата');

        const player = alt.Player.local;
        const ped = player.scriptID;

        const vendingConfig = this.config.vendingMachine;
        const animConfig = vendingConfig.animations;

        // Перемещает игрока и задаёт новую ориентацию
        native.freezeEntityPosition(player, true);
        native.setEntityCoordsNoOffset(player, vendingConfig.position.x, vendingConfig.position.y, vendingConfig.position.z, false, false, false);
        native.setEntityRotation(player, 0, 0, vendingConfig.position.rotZ, 2, true);

        // пауза для корректного позиционирования
        await wait(300);
        //первая анимация, анимация покупки
        native.taskPlayAnim(ped, animConfig.dict, animConfig.use, 8.0, -8.0, -1, 0, 0, false, false, false);
        await wait(2200);
        //спавн пропа после анимации покупки
        const drinkCan = await this.spawnProp('ng_proc_sodacan_01a');
        //запуск второй анимации
        native.taskPlayAnim(ped, animConfig.dict, animConfig.drink, 8.0, -8.0, -1, 0, 0, false, false, false);
        await wait(1800);
        AnimationManager.deleteProp(drinkCan);
        //после завершения всех анимаций и удаления пропа
        native.clearPedTasks(ped);
        native.freezeEntityPosition(player, false);
        alt.log('Анимация покупки завершена');
    }
}