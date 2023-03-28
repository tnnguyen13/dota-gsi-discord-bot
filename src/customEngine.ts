import Engine from "./engine/Engine";
import Fact from "./engine/Fact";
import FactStore from "./engine/FactStore";
import GsiData from "./gsi/GsiData";
import log from "./log";
import topics from "./topics";

class CustomEngine extends Engine {
    private sessions: Map<string, FactStore> = new Map();

    private withDb(
        studentId: string | null,
        effectFn: (db: FactStore) => void
    ) {
        if (studentId) {
            const db = this.sessions.get(studentId);
            if (db) {
                effectFn(db);
            }
        }
    }

    public setGsi(studentId: string | null, data: GsiData) {
        this.withDb(studentId, (db) =>
            this.set(db, new Fact(topics.gsiData, data))
        );
    }

    public readyToPlayAudio(studentId: string, ready: boolean) {
        this.withDb(studentId, (db) =>
            this.set(db, new Fact(topics.discordReadyToPlayAudio, ready))
        );
    }

    public startCoachingSession(
        studentId: string,
        guildId: string,
        channelId: string
    ) {
        this.sessions.set(studentId, new FactStore());
        this.withDb(studentId, (db) => {
            this.set(db, new Fact(topics.studentId, studentId));
            this.set(db, new Fact(topics.discordGuildId, guildId));
            this.set(db, new Fact(topics.discordGuildChannelId, channelId));
        });
    }

    public stopCoachingSession(studentId: string) {
        this.withDb(studentId, (db) => {
            const subscription = db.get(topics.discordSubscriptionTopic);
            subscription?.connection.destroy();
        });
    }

    public lostVoiceConnection(studentId: string) {
        log.info("rules", "Deleting database for student %s", studentId);
        this.sessions.delete(studentId);
    }
}

const engine = new CustomEngine();

export default engine;
