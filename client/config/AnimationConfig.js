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