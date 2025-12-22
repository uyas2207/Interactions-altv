import * as alt from 'alt-client';

import { ProgressBar } from './ProgressBar.js';
import { TapCounter } from './TapCounter.js';


// основной менеджер
export class NotificationManager {

    static instance = null;

    static getInstance() {
        if (!this.instance) {   // если экземпляр не существует создает его
            alt.log('instance создан в первый раз:');
            this.instance = new NotificationManager();
        }
        //alt.log('Передан instance:');
        //alt.log(`this.instance: ${JSON.stringify(this.instance, null, '\t')}`);
        // возвращает существующий или только что созданный экземпляр
        return this.instance;
        
    }

    constructor() {
        // защита от потворного вызова constructor
        if (NotificationManager.instance) {
            alt.log('Повторный вызов constructor NotificationManager');
            return NotificationManager.instance;
        }
    
        this.webView = null;       // сслыка на место хранения webview
        this.isInitialized = false; // для защиты от вызова webview до инициализации
        this.isWebViewOpen = false; // для проверки показывается ли в текущий момент webview (в теории можно убрать и проверять через this.activeNotifications.size)
        this.activeNotifications = new Map();   //хранит список всех активных webview

        NotificationManager.instance = this;
    }

    async initialize() {
        // защита от повторной инициализации
        if (this.isInitialized) {
            alt.log('NotificationManager уже инициализирован (ПОВТОРНАЯ ПОПЫТКА ВЫЗОВА INITIALIZE)');
            return;
        }
        await this.init();
    }

    async init() {
        this.webView = new alt.WebView("http://resource/client/html/index.html");

            await new Promise(resolve => {
                this.webView.once('load', resolve);
            });
            this.isInitialized = true;
            alt.log('Notification manager initialized');
        /*
        let resolveLoad, resolveTimeout;
        let isResolved = false;
        //попытка инициализации, если не инициализируется за 2 секунды будет isLoaded false
        const loadPromise = new Promise((resolve) => {
            resolveLoad = () => {
                if (!isResolved) {  //защита от повторого завершения промиса для Promise.race
                    isResolved = true;
                    resolve(true);
                }
            };
        });

        const timeoutPromise = new Promise((resolve) => {
            resolveTimeout = () => {
                if (!isResolved) {  //защита от повторого завершения промиса для Promise.race
                    isResolved = true;
                    resolve(false);
                }
            };
        });

        this.webView.once("load", resolveLoad);
        alt.setTimeout(resolveTimeout, 5000);

        const isLoaded = await Promise.race([loadPromise, timeoutPromise]);

        this.isInitialized = isLoaded;
        */
    }

    createProgressBar(id, title, progress = 0, text = "") {
        const progressBar = new ProgressBar(this, id, title, progress, text);    // создает ProgressBar с переданными параметрами
        progressBar.show(); 
        return progressBar; //возвращает ProgressBar для запоминаяния в классе Interaction
    }

    createTapCounter(id, title, currentTaps = 0, requiredTaps = 0, text = "") {
        const tapCounter = new TapCounter(this, id, title, currentTaps, requiredTaps, text);    // создает TapCounter с переданными параметрами
        tapCounter.show();
        return tapCounter;  //возвращает TapCounter для запоминаяния в класс Interaction
    }

    // общий метод для isWebViewOpen = false;
    updateWebViewState() {
        if (this.activeNotifications.size === 0) {
            this.isWebViewOpen = false;
            alt.log('updateWebViewState сделал isWebViewOpen = false;');
        }
    }
}