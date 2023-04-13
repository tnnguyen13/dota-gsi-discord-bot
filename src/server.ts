import {
    defaultConfigs,
    EffectConfig,
    effectFromString,
} from "./effectConfigManager";
import engine from "./customEngine";
import express from "express";
import Fact from "./engine/Fact";
import gsiParser from "./gsiParser";
import log from "./log";
import path from "path";
import topicManager from "./engine/topicManager";
import topics from "./topics";

const app = express();

app.set("strict routing", true);
app.set("x-powered-by", false);

const router = express.Router({ strict: true });

router.use(express.json());

router.use(
    "/resources/audio",
    express.static(path.join(__dirname, "../resources/audio"))
);

router.get("/", (req, res) => {
    res.status(200).send("hello :3");
});

router.get("/instructions", (req, res) => {
    res.status(200).sendFile(
        path.join(__dirname, "../resources/instructions.html")
    );
});

router.get("/coach/:studentId/", (req, res) => {
    res.status(200).sendFile(
        path.join(__dirname, "../resources/studentPage.html")
    );
});

router.get("/coach/:studentId/discordAudioEnabled", (req, res) => {
    res.status(200).json(
        engine.getFactValue(req.params.studentId, topics.discordAudioEnabled) ||
            false
    );
});

router.get("/coach/:studentId/config", (req, res) => {
    res.status(200).json(
        topicManager
            .getConfigTopics()
            .map((topic) => [
                topic.label,
                engine.getFactValue(req.params.studentId, topic),
            ])
    );
});

router.post("/coach/:studentId/config/:topic/:effect", (req, res) => {
    engine.setFact(
        req.params.studentId,
        new Fact<EffectConfig>(
            topicManager.findTopic(req.params.topic),
            effectFromString(req.params.effect)
        )
    );
    res.status(200).send();
});

router.get("/coach/:studentId/poll", (req, res) => {
    const id = req.params.studentId;
    const nextAudio = engine.handleNextPrivateAudio(id);
    const configUpdated = engine.pollConfigUpdateAndReset(id);
    if (nextAudio) {
        log.info("effect", "Playing private audio %s", nextAudio.magenta);
        res.status(200).json({ nextAudio: nextAudio });
    } else if (configUpdated) {
        res.status(200).json({ configUpdated: true });
    } else {
        res.status(200).send([null]);
    }
});

router.post("/coach/:studentId/stop-audio", (req, res) => {
    engine.setFact(req.params.studentId, new Fact(topics.stopAudio, true));
    engine.setFact(
        req.params.studentId,
        new Fact(topics.privateAudioQueue, undefined)
    );
    engine.setFact(
        req.params.studentId,
        new Fact(topics.publicAudioQueue, undefined)
    );
    res.status(200).send();
});

router.post("/coach/:studentId/reset-config", (req, res) => {
    defaultConfigs().map((fact) => engine.setFact(req.params.studentId, fact));
    res.status(200).send();
});

router.head("/gsi", (req, res) => {
    res.status(200).send();
});

router.post("/gsi", (req, res) => {
    gsiParser.feedState(req.body);
    res.status(200).send();
});

app.use("/", router);

export default app;
