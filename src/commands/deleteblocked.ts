/* eslint-disable @typescript-eslint/no-unused-vars */
import BlockedUsers from "../utils/blockedUsers";
import { ChatClient } from "twitch-chat-client/lib";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import { USERS } from "../utils/globals";
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

    if (!USERS.blocked.includes(blockedUser)) {
        return chatClient.say(channel, "That user is not on the list!");
    }

    const userIndex = USERS.blocked.indexOf(blockedUser);
    USERS.blocked.splice(userIndex, 1);
    BlockedUsers.saveConfig();

    return chatClient.say(channel, `${blockedUser} has been removed from the blocked list!`);
};