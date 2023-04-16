jest.mock("@discordjs/voice");
jest.mock("../../log");
jest.mock("../../customEngine");
jest.mock("../discordHelpers");

import CryptoJS from "crypto-js";
import engine from "../../customEngine";
import handle from "../handleSlashCommands";
import helper from "../discordHelpers";
import topics from "../../topics";
import Voice from "@discordjs/voice";

const STUDENT_ID = CryptoJS.HmacSHA256(
    "userId",
    "test_STUDENT_ID_HASH_PRIVATE_KEY"
).toString();

describe("handleSlashCommands", () => {
    let interaction: any;
    let mockReply: jest.Mock<any, any, any>;

    beforeEach(() => {
        mockReply = jest.fn();
        interaction = {
            channel: {
                isVoiceBased: () => true,
            },
            channelId: "channelId",
            guild: {
                id: "guildId",
                voiceAdapterCreator: "voiceAdapterCreator",
            },
            guildId: "guildId",
            user: { id: "userId" },
            reply: mockReply,
        };
    });

    describe("coachMe", () => {
        beforeEach(() => {
            handle.coachMe(interaction);
        });
        test("replies ephemerally", () => {
            expect(mockReply).toHaveBeenCalledWith({
                content: expect.stringContaining("Starting..."),
                ephemeral: true,
            });
        });

        test("calls engine.startCoachingSession with the proper params", () => {
            expect(engine.startCoachingSession).toHaveBeenCalledWith(
                STUDENT_ID,
                "guildId",
                "channelId"
            );
        });
    });

    describe("stop", () => {
        describe("existing coaching session in channel", () => {
            beforeEach(() => {
                (helper.numberOfPeopleConnected as jest.Mock).mockReturnValue(
                    1
                );
                handle.stop(interaction);
            });
            test("joins the voice channel", () => {
                expect(Voice.joinVoiceChannel).toHaveBeenCalledWith({
                    adapterCreator: "voiceAdapterCreator",
                    channelId: "channelId",
                    guildId: "guildId",
                });
            });
            test("destroys the voice channel", () => {
                const mockVoice = Voice.joinVoiceChannel as jest.Mock;
                const spyDestroy = jest.spyOn(
                    mockVoice.mock.results[0].value as any,
                    "destroy"
                );
                expect(spyDestroy).toHaveBeenCalledTimes(1);
            });
            test("notifies user coaching session is ending", () => {
                expect(mockReply).toHaveBeenCalledWith({
                    content: expect.stringContaining("Ending coaching session"),
                    ephemeral: true,
                });
            });
        });

        describe("no coaching session in channel", () => {
            describe("student has a voice subscription", () => {
                let mockDestroyVoiceConnection: jest.Mock;
                beforeEach(() => {
                    mockDestroyVoiceConnection = jest.fn();
                    (engine.getFactValue as jest.Mock).mockReturnValue({
                        connection: {
                            destroy: mockDestroyVoiceConnection,
                        },
                    });
                    (
                        helper.numberOfPeopleConnected as jest.Mock
                    ).mockReturnValue(0);
                    handle.stop(interaction);
                });
                test("gets proper fact from engine", () => {
                    expect(engine.getFactValue).toHaveBeenCalledWith(
                        STUDENT_ID,
                        topics.discordSubscriptionTopic
                    );
                });
                test("destroys the voice channel", () => {
                    expect(mockDestroyVoiceConnection).toHaveBeenCalledTimes(1);
                });
                test("notifies user coaching session is ending", () => {
                    expect(mockReply).toHaveBeenCalledWith({
                        content: "Ending your coaching session...",
                        ephemeral: true,
                    });
                });
            });
            describe("user does not have a voice subscription", () => {
                beforeEach(() => {
                    (engine.getFactValue as jest.Mock).mockReturnValue(
                        undefined
                    );
                    (
                        helper.numberOfPeopleConnected as jest.Mock
                    ).mockReturnValue(0);
                    handle.stop(interaction);
                });
                test("should directly tell engine to delete session", () => {
                    expect(engine.deleteSession).toHaveBeenCalledWith(
                        STUDENT_ID
                    );
                });
                test("notifies user coaching session is ending", () => {
                    expect(mockReply).toHaveBeenCalledWith({
                        content: "Ending your coaching session...",
                        ephemeral: true,
                    });
                });
            });
        });
        test("no guild id in interaction", () => {
            handle.stop({ ...interaction, ...{ guild: undefined } });
            expect(mockReply).toHaveBeenCalledWith({
                content: expect.stringContaining(
                    "problem ending coaching session"
                ),
                ephemeral: true,
            });
        });
    });

    test("config replies ephemerally", () => {
        handle.config(interaction);

        expect(mockReply).toHaveBeenCalledWith({
            content: expect.anything(),
            ephemeral: true,
        });
    });

    test("help replies ephemerally", () => {
        handle.help(interaction);

        expect(mockReply).toHaveBeenCalledWith({
            content: expect.anything(),
            ephemeral: true,
        });
    });
});
