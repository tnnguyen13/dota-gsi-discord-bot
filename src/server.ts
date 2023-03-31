import Config, { configDb } from "./configTopics";
import engine from "./customEngine";
import express from "express";
import gsiParser from "./gsiParser";
import log from "./log";
import path from "path";
import Topic from "./engine/Topic";

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

router.get("/coach/:studentId/config", (req, res) => {
    const foo = Array.from(configDb)
        .map(([_, topic]) => topic)
        .map((topic) => [
            topic.label,
            engine.getConfig(req.params.studentId, topic),
        ]);

    res.status(200).json(foo);
});

router.get("/coach/:studentId/poll", (req, res) => {
    const id = req.params.studentId;
    const nextAudio = engine.handleNextPrivateAudio(id);
    if (nextAudio) {
        log.info("effect", "Playing private audio %s", nextAudio.blue);
        res.status(200).json([nextAudio]);
    } else {
        res.status(200).json([null]);
    }
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
