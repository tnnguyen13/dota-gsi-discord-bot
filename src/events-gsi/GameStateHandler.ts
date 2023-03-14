import handler from "../events-app/eventHandlers";

const events = [
    handler.roshan,
];

export default class GameStateHandler {
    inGame = false;

    isInGame(newInGame: boolean) {
        if (this.inGame !== newInGame) {
            this.inGame = newInGame;
            events.map((event) => event.inGame(newInGame));
        }
    }
}