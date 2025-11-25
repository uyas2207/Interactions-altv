import * as alt from 'alt-server';

export class ServerEvents {
    static setupSystemEvents(interactionServer) {

                alt.on('playerConnect', async (player) => {
                    interactionServer.initializePlayer(player);
                    interactionServer.demonstrationScene(player);
                });
        
                alt.onClient('client:succesSingleTapInteraction', (player) => {
                    interactionServer.completeInteraction(player, InteractionType.VENDING);
                });
        
                alt.onClient('client:succesMultiTapInteraction', (player) => {
                    interactionServer.completeInteraction(player, InteractionType.EXERCISE);
                });
        
                alt.onClient('client:succesHoldInteraction', (player) => {
                    interactionServer.completeInteraction(player, InteractionType.VEHICLE);
                });
        
    }
}