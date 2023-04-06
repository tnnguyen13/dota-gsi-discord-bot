import Topic from "./Topic";

/**
 * A `PersistentTopic` describes the type of data (i.e. Time is a number)
 * And its persistence preferences (across restarts or across games - defaults to false)
 */
export default class PersistentTopic<Type> extends Topic<Type> {
    public readonly persistAcrossRestarts: boolean;
    public readonly persistAcrossGames: boolean;

    /**
     * Create a topic
     * @param label
     * @param opts Optional params to mark if you want to persist data across restart or games (default is false)
     */
    public constructor(
        label: string,
        opts?: { persistAcrossRestarts?: boolean; persistAcrossGames?: boolean }
    ) {
        super(label);

        this.persistAcrossRestarts = opts?.persistAcrossRestarts || false;
        this.persistAcrossGames = opts?.persistAcrossGames || false;
    }
}
