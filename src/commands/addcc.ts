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
        return void chatClient.say(channel, "Please write down a command name");
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (args[1] === undefined) {
        return void chatClient.say(channel, "Please include a message to go with the command!");
    }

    const command = args.slice(1);
    const commandContent = command.join(" ");

    const cmd = `${commandContent} ${args[0]}`;

    const cmds: string[] = [];

    USERS.customCommands.forEach((custom) => {
        const messages = custom.split(" ");
        const last = messages[messages.length - 1];
        cmds.push(last);

    });

    if (cmds.includes(args[0])) {
        return void chatClient.say(channel, `${args[0]} already exists! please use "!listcc" to check which ones exist`);
    }

    USERS.customCommands.push(cmd);
    Users.saveConfig();

    return void chatClient.say(channel, `I have added the command "${args[0]}" to the custom commands list!`);
};