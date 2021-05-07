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
        return chatClient.say(channel, "Please type a user's name to add them to the list");
    }
    // eslint-disable-next-line prefer-destructuring
    const blockedUser = args[0].toLowerCase();

    if (USERS.blocked.some((check) => check === blockedUser)) {
        return chatClient.say(channel, "That user is already on the list!");
    }

    USERS.blocked.push(blockedUser);
    Users.saveConfig();
    return chatClient.say(channel, `${blockedUser} has been added to the blocked list!`);
};