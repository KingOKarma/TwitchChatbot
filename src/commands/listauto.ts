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


    if (USERS.autoMsgs.length === 0) {
        return void chatClient.say(channel, "The auto messages are currently empty please type !addauto <message> to add a new auto message");
    }

    const IDS = USERS.autoMsgs.map((list, index) => `${index + 1} - ${list}`);

    return chatClient.say(channel, IDS.join(",\n "));

};