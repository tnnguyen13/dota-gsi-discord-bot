import SideEffectInfo, {
    Type,
} from "../SideEffectInfo";
import discord from "../discord";
import effects from "../effectsRegistry";
import path from "node:path";

effects.register(Type.AUDIO_FILE, (info: SideEffectInfo) => {
    if (info.data) {
        discord.playAudioFile(path.join(__dirname, "../../audio/", info.data));
    }
});
