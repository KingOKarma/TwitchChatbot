/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatClient } from "twitch-chat-client/lib";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { USERS } from "../utils/globals";

exports.run = async (chatClient: ChatClient,
    channel: string,
    user: string,
    message: string,
    msg: TwitchPrivateMessage,
    args: string[]): Promise<void> => {


    if (USERS.blocked.length === 0) {
        return chatClient.say(channel, "The blocked list is currently empty! You can add to it with !addblocked");
    }

    const returnMSG = USERS.blocked.map((author) => `${author},  `);

    return chatClient.say(channel, `Blocked users: ${returnMSG}`);
};