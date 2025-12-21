import * as alt from 'alt-client';
import { intractionConfig } from '@config/IntractionConfig.js';

//Шаблон для классов наследников
export class InteractionBase {
    constructor(pointData) {
        this.point = pointData;
        this.keyEDebounceMs = 1500; // задержка между нажатиями
        this.lastKeyEPressTime = 0;
    }

    startInteraction() {}
    stopInteraction() {}
    updateInteraction() {}
    keyPressHandler() {}
    keyUpHandler() { return; }
    getInteractionText() { return ""; }
    
    //общий метод для дебаунса от спама
    canProcessKeyPress(key) {
        // Проверяем дебаунс только для клавиши E (код 69 соответствует клавише E)
        if (key === intractionConfig.intractionKey) {
            // Получаем текущее время в миллисекундах
            const currentTime = Date.now();
            // Вычисляем сколько времени прошло с последнего нажатия клавиши E
            const timeSinceLastPress = currentTime - this.lastKeyEPressTime;
            
            // Если прошло меньше времени, чем установленный дебаунс, игнорируем нажатие
            if (timeSinceLastPress < this.keyEDebounceMs) {
                alt.log(`Дебаунс E: нажатие проигнорировано (${timeSinceLastPress}ms < ${this.keyEDebounceMs}ms)`);
                return false; // Запрещаем обработку нажатия
            }
            
            // Обновляем время последнего нажатия клавиши E на текущее время
            this.lastKeyEPressTime = currentTime;
        }
        
        // Для других клавиш дебаунс не применяется - всегда разрешаем обработку
        return true;
    }
    
}