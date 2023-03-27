import engine from "../customEngine";
import Fact from "../engine/Fact";
import path from "path";
import Rule from "../engine/Rule";
import topic from "../topic";

engine.register(
    new Rule("effect/playAudio", [topic.playAudioFile], (get) => {
        const queue = [...(get(topic.audioQueue) || [])];
        const fileName = path.join(
            __dirname,
            "../../",
            get(topic.playAudioFile)!
        );

        queue.push(fileName);

        return [
            new Fact(topic.audioQueue, queue),
            new Fact(topic.playAudioFile, undefined),
        ];
    })
);
