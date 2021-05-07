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
        return void chatClient.say(
            channel,
            "Please use the ID of the autMsg to remove it, you can find the id by doing !listauto to list all messages");
    }

    // Checks the location in the array for the role
    const roleIndex = Number(args[0]) - 1;

    const autoMsg = USERS.autoMsgs[roleIndex];

    // Checks if the msg they want to add is already added
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (autoMsg === undefined) {
        return void chatClient.say(
            channel, "That Message doesn't exist! - Please use the ID of the autMsg to remove it, you can find the id by doing !listauto to list all messages");
    }

    USERS.autoMsgs.splice(roleIndex, 1);
    Users.saveConfig();
    return chatClient.say(channel, `I have removed "${autoMsg}"`);
};