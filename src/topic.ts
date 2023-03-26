/* eslint-disable sort-keys */
import { DeepReadonly } from "ts-essentials";
import Event from "./classes/data/Event";
import GsiData from "./gsi/GsiData";
import PlayerItems from "./classes/data/PlayerItems";
import Topic from "./classes/engine/Topic";

const gsiData = {
    gsiData: new Topic<DeepReadonly<GsiData>>("gsiData"),
};

const gsi = {
    alive: new Topic<boolean>("alive"),
    events: new Topic<DeepReadonly<Event[]>>("events"),
    inGame: new Topic<boolean>("inGame"),
    items: new Topic<DeepReadonly<PlayerItems>>("items"),
    time: new Topic<number>("time"),
};

const effects = {
    playAudioFile: new Topic<string>("playAudioFile"),
    playTts: new Topic<string>("playTts"),

    registerStudentId: new Topic<string>("registerStudent"),
    unregisterStudentId: new Topic<string>("unregisterStudent"),
};

const discord = {
    discordBotSecret: new Topic<string>("registerDiscordBotSecret"),
    discordGuildId: new Topic<string>("registerDiscordGuild"),
    discordGuildChannelId: new Topic<string>("registerDiscordGuildChannel"),
    // playing audio
    discordReadyToPlayAudio: new Topic<boolean>("discordReadyToPlayAudio"),
    audioQueue: new Topic<DeepReadonly<string[]>>("discordAudioQueue"),
};

const appState = {
    currentlyCoachedStudentIds: new Topic<DeepReadonly<Set<string>>>(
        "currentlyCoachedStudentIds"
    ),
};

/**
 * These are topics that cross different modules
 * A module may still choose to store a locally owned topic
 * that no one else needs to know about,
 * in which case it can be declared inside the module
 */
export default {
    ...gsiData,
    ...effects,
    ...gsi,
    ...discord,
    ...appState,
};
