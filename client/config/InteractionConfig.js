import * as alt from 'alt-client';

export const interactionPoints = [
    {   //данные точки для взлома машины
        position: new alt.Vector3(-1275.08, -1431.94, 3.47),
        config: {
            interactionType: InteractionType.VEHICLE,
            color: new alt.RGBA(241, 196, 15),
            scale: new alt.Vector3(1.5, 1.5, 1.5),
            markerType: 1,
            heightOffset: 1,    // + по координате z
            radius: 1
        }
    },
    {   //данные точки для упражнений
        position: new alt.Vector3(-1273.76, -1427.74, 3.34),
        config: {
            interactionType: InteractionType.EXERCISE,
            color: new alt.RGBA(46, 204, 113),
            scale: new alt.Vector3(1.5, 1.5, 1.5),
            markerType: 1,
            heightOffset: 1,    // + по координате z
            radius: 1
        }
    },
    {   //данные точки для автомата с колой
        position: new alt.Vector3(-1269.45, -1428.14, 3.34),
        config: {
            interactionType: InteractionType.VENDING,
            color: new alt.RGBA(52, 152, 219),
            scale: new alt.Vector3(1.5, 1.5, 1.5),
            markerType: 1,
            heightOffset: 1,
            radius: 1
        }
    }
];

export const animationConfig = {
    // Настройки для спавна пропов
    propSettings: {
        boneIndex: 71, // индекс кости правой руки
        // настройки для разных моделей пропов
        modelOffsets: {
            'ng_proc_sodacan_01a': {
                offsetX: 0.12,
                offsetY: -0.07,
                offsetZ: -0.07,
                rotX: -70.0,
                rotY: 0.0,
                rotZ: 0.0
            }
        },
        // общие настройки для attachEntityToEntity
        attachSettings: {
            p9: false,              // false обычный attach
            useSoftPinning: true,   // мягкое прикрепление
            collision: false,       // учитывать коллизии
            isPed: true,            // объект прикреплён к педу
            vertexIndex: 0,         // индекс вершины
            fixedRot: true,         // фиксировать вращение
            p15: 0                  // вроде как разеревный параметр который ничего не делает
        }
    },
    
    // настройки для анимации торгового автомата
    vendingMachine: {
        position: {
            x: -1269.3890380859375,
            y: -1428.19775390625,
            z: 4.3421630859375,
            rotZ: -51.023
        },
        animations: {
            dict: 'mini@sprunk',
            use: 'plyr_buy_drink_pt1',
            drink: 'plyr_buy_drink_pt2'
        }
    }
};