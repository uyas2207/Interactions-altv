import * as alt from 'alt-client';

export const interactionPoints = [
    {   //данные точки для взлома машины
        position: new alt.Vector3(
            pointsCoords[InteractionType.VEHICLE].x,
            pointsCoords[InteractionType.VEHICLE].y,
            pointsCoords[InteractionType.VEHICLE].z
        ),
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
        position: new alt.Vector3(
            pointsCoords[InteractionType.EXERCISE].x,
            pointsCoords[InteractionType.EXERCISE].y,
            pointsCoords[InteractionType.EXERCISE].z
        ),
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
        position: new alt.Vector3(
            pointsCoords[InteractionType.VENDING].x,
            pointsCoords[InteractionType.VENDING].y,
            pointsCoords[InteractionType.VENDING].z
        ),
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