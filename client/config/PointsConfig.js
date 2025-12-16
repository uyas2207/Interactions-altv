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