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

    if (USERS.customCommands.length === 0) {
        return void chatClient.say(channel, "The custom commands are currently empty please type"
        + " !addcc <commandName> <message> to add a new custom command");
    }

    const IDS: string[] = [];


    USERS.customCommands.forEach((cmd) => {
        const messages = cmd.split(" ");
        const last = messages[messages.length - 1];
        IDS.push(last);
    });

    const mapped = IDS.map((list, index) => `${index + 1} - ${list}`);


    return chatClient.say(channel, mapped.join(",\n "));


};