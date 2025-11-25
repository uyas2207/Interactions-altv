import * as chat from 'alt:chat';

export class InteractionCommands {
    static register(interactionServer) {

                chat.registerCmd('create', (player, arg) => {
                    if (!arg || !['1', '2', '3'].includes(String(arg))) {
                        chat.send(player, 'Использование: /create 1,2,3');
                        return;
                    }
                    const type = parseInt(arg[0]);
                    interactionServer.createPoint(player, type);
                });
                
    }
}