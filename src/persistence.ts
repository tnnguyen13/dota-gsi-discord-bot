/* eslint-disable sort-keys */
import dotenv = require("dotenv");
import fs from "fs";
import path = require("path");
import log from "./log";
dotenv.config();

const dataPath = process.env.PERSISTENCE_DATA_PATH!;

const RESTART_DATA_FILE_PATH = path.join(dataPath, "restartData.json");
const STUDENT_DATA_DIRECTORY_PATH = path.join(dataPath, "student");

if (!fs.existsSync(STUDENT_DATA_DIRECTORY_PATH)) {
    fs.mkdirSync(STUDENT_DATA_DIRECTORY_PATH, {
        recursive: true,
    });
}

function saveRestartData(data: string) {
    log.info("app", "Saving data %s", data);
    fs.writeFileSync(RESTART_DATA_FILE_PATH, data);
}

function readRestartData() {
    if (fs.existsSync(RESTART_DATA_FILE_PATH)) {
        const data = fs.readFileSync(RESTART_DATA_FILE_PATH, "utf8");
        fs.unlinkSync(RESTART_DATA_FILE_PATH);
        log.info("app", "Reading data %s", data);
        return data;
    }
}

function readStudentData(studentId: string) {
    const studentFile = path.join(
        STUDENT_DATA_DIRECTORY_PATH,
        `${studentId}.json`
    );
    if (fs.existsSync(studentFile)) {
        return fs.readFileSync(studentFile, "utf8");
    }
}

function saveStudentData(studentId: string, data: string) {
    const studentFile = path.join(
        STUDENT_DATA_DIRECTORY_PATH,
        `${studentId}.json`
    );
    fs.writeFileSync(studentFile, data);
}

export default {
    saveRestartData,
    readRestartData,

    saveStudentData,
    readStudentData,
};
