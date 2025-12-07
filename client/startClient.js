import * as alt from 'alt-client';

import { AnimationManager } from '@classes/AnimationManager.js';
import { PointVisuals } from './classes/PointVisuals.js';
import { SingleTapInteraction } from '@interactions/SingleTapInteraction.js';
import { MultiTapInteraction } from '@interactions/MultiTapInteraction.js';
import { HoldInteraction } from '@interactions/HoldInteraction.js';
import { NotificationManager } from '@notifications/NotificationManager.js';
import { interactionPoints } from '@config/InteractionConfig.js';


class Interaction {
    constructor() {
        this.currentInteraction = null;
        this.activeInteractions = null;
        this.colshapes = [];    // массив существующих колшейпов
        this.markers = [];      // массив существующих маркеров

        this.interactionPoints = interactionPoints;      
        this.init();
    }

    async init() {
        this.initializeNotificationManager();

        alt.onServer('client:sceneDemo', async (activeInteractions) => {
            this.spawnPoints(activeInteractions);     //создание колшейпов и маркеров
            await this.preloadAnims();  //предзагрузка всех необходимых анимаций 
        });
        //запрос с серввера на удаление точки (после успешного выполнения интеракции на клиенте)
        alt.onServer('client:delPoint', (interactionType) => {
            this.delPoint(interactionType);
        });
        //для создания точки по команде /create (с сервера)
        alt.onServer('client:createPoint', (type) => {
            this.createPoint(type);
        });

        alt.on('entityEnterColshape', (colshape, entity) => this.handleEntityEnterColshape(colshape, entity));
        alt.on('entityLeaveColshape', (colshape, entity) => this.handleEntityLeaveColshape(colshape, entity));
    }
    
    // метод для инициализации NotificationManager
    async initializeNotificationManager() {
        alt.log('1. Инициализация NotificationManager');
        // получает экземпляр Singleton (создается при первом вызове)
        const notificationManager = NotificationManager.getInstance();
        
        //инициализирует WebView
        await notificationManager.initialize();
            
        alt.log('1. NotificationManager инициализирован через Interaction');
    }

    //предзагрузка всех необходимых анимаций 
    async preloadAnims() {
        // последовательная загрузка необходимых анимаций
        await AnimationManager.loadAnimDict('mini@sprunk');
        await AnimationManager.loadAnimDict('amb@world_human_push_ups@male@base');
        await AnimationManager.loadAnimDict('amb@world_human_push_ups@male@idle_a');
        await AnimationManager.loadAnimDict('amb@world_human_push_ups@male@exit');
        await AnimationManager.loadAnimDict('amb@world_human_stand_mobile@male@text@base');
    }

    
    spawnPoints(activeInteractions) {
        //alt.log(`activeInteractions ${activeInteractions}`)
        this.interactionPoints.forEach((point, index) => {
            if (activeInteractions.includes(point.config.interactionType)){
            const visuals = new PointVisuals(point.position, point.config).create();
        
            // добавление дополнительных свойств для колшейпов
            visuals.colshape.interactionType = point.config.interactionType;
            visuals.colshape.pointIndex = index; // для идентификации точки
        
            // добавление данных созданной точки в массивы
            this.markers.push(visuals.marker);
            this.colshapes.push(visuals.colshape);
            }
        });
        alt.log(`Создано маркеров: ${this.markers.length}`);
        alt.log(`Создано колшейпов: ${this.colshapes.length}`);
        alt.log(`Массив колшейпов:`, this.colshapes);
    }
 
    delPoint(interactionType) {
        // поиск индекса в массиве colshapes по interactionType
        const index = this.colshapes.findIndex(colshape => colshape && colshape.interactionType === interactionType);

        if (index === -1) {
            alt.log(`Попытка удалить несуществующую точку: ${interactionType}`);    
            return;
        }
    
        const marker = this.markers[index];
        const colshape = this.colshapes[index];

        if (marker && marker.destroy) {
            marker.destroy();
            this.markers[index] = null;
        }
        if (colshape && colshape.destroy) {
            colshape.destroy();
            this.colshapes[index] = null;
        }

        alt.log(`Точка с interactionType ${interactionType} удалена.`);
    }
    //для создания точки по команде /create (с сервера)
    createPoint(type) {
        //поиск по инедексу 
        const pointIndex = this.interactionPoints.findIndex(point => point.config.interactionType === type);
        
        if (pointIndex === -1) {
            alt.log(`Неизвестный тип точки: ${type}`);
            return;
        }

        const pointData = this.interactionPoints[pointIndex]; // получение данных по индексу

        const visuals = new PointVisuals(pointData.position, pointData.config).create();
    
        // Добавление дополнительных свойств для колшейпов
        visuals.colshape.interactionType = pointData.config.interactionType;
        visuals.colshape.pointIndex = pointIndex;

        // добавление данных созданной точки в массивы
        this.markers.push(visuals.marker);
        this.colshapes.push(visuals.colshape);
    
        alt.log(`Создана точка типа ${type}`);
    }

    //метод который вызывается при входе в колшейп
    handleEntityEnterColshape(colshape, entity) {
        if (!(entity instanceof alt.Player)) return;
        if (!colshape.interactionType) return;  //если в будущем будут добавлены другие колшейпы
        if(!this.checkDistance(colshape)) return;   //проверка дистанции от читеров
        
        this.currentInteraction = this.createInteraction(colshape.interactionType, colshape.index); //запоминает и создает webview уведмоления в зависимости от типа колшейпа в который вошел игрок
        this.currentInteraction.startInteraction(); //вызов логики для конкретного типа взаимодействия
    }
    
    //проверка дистанции от читеров
    checkDistance(colshape){
        const pointData = this.interactionPoints[colshape.pointIndex];
        const distance = pointData.position.distanceTo(alt.Player.local.pos);
        if(distance>3){
            alt.log(`distance: ${distance}> 3`);
            return false;
        }
        else{
            alt.log('Проверка дистанции пройдена успешно');
            return true;
        }
    }


    //метод который вызывается при выходе из колшейпа
    handleEntityLeaveColshape(colshape, entity) {
        if (!(entity instanceof alt.Player)) return;
        if (!this.currentInteraction) return;   //если в будущем будут добавлены другие колшейпы

        this.currentInteraction.stopInteraction();  //вызов логики отмены для конкретного типа взаимодействия
        this.currentInteraction = null; 
    }
    //создает webview уведмоления в зависимости от типа колшейпа в который вошел игрок
    createInteraction(type, index) {
        const pointData = this.interactionPoints[index];
        switch (type) {
            case InteractionType.VEHICLE: return new HoldInteraction(pointData);
            case InteractionType.EXERCISE: return new MultiTapInteraction(pointData);
            case InteractionType.VENDING: return new SingleTapInteraction(pointData);
        }
    }
}

new Interaction(); 