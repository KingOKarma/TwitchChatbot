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

    if (USERS.canSendMessage) {
        USERS.canSendMessage = false;
        Users.saveConfig();
        return chatClient.say(channel, "Chat is no longer senidng to discord!");

    }
    USERS.canSendMessage = true;
    Users.saveConfig();
    return chatClient.say(channel, "Chat is now being sent to discord!");
};