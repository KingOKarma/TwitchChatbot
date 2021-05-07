/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatClient } from "twitch-chat-client/lib";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { USERS } from "../utils/globals";
import Users from "../utils/users";
import { checkPerms } from "../utils/events";

exports.run = async (chatClient: ChatClient,
    channel: string,
    user: string,
    message: string,
    msg: TwitchPrivateMessage,
    args: string[]): Promise<void> => {

    const perms = checkPerms(msg);
    if (!perms) return chatClient.say(channel, "Sorry this command can only be used by staff");

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (args[0] === undefined) {
        return chatClient.say(channel, "Please type a word/phrase to add to the auto message list");
    }
    // eslint-disable-next-line prefer-destructuring
    const newAutoMsg = args.join(" ");

    if (USERS.autoMsgs.some((check) => check.toLowerCase() === newAutoMsg.toLowerCase())) {
        return chatClient.say(channel, "That word/Phrase is already on the list!");
    }

    USERS.autoMsgs.push(newAutoMsg);
    Users.saveConfig();
    return chatClient.say(channel, `"${newAutoMsg}" has been added to the auto message list!`);
};