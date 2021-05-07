/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatSubInfo, UserNotice } from "twitch-chat-client/lib";
import { Client, Message, TextChannel } from "discord.js";
import { CONFIG } from "../globals";

export async function onSub(
    channel: string,
    user: string,
    subInfo: ChatSubInfo,
    msg: UserNotice,
    bot: Client
): Promise<Message | Message[] | undefined> {
    if (channel !== `#${CONFIG.twitchUsername}`) return;
    let subMessage;
    const eventsChannel = await bot.channels.fetch(CONFIG.eventsChannelID) as TextChannel;

    switch (subInfo.plan) {
        case "1000":
            subMessage = `${subInfo.displayName} Is now a tier 1 Sub!`;
            break;


        case "2000":
            subMessage = `${subInfo.displayName} Is now a tier 2 Sub!`;
            break;


        case "3000":
            subMessage = `${subInfo.displayName} Is now a tier 3 Sub!`;
            break;
    }

    if (subMessage === undefined) {
        return eventsChannel.send("Someone subbed but i cant get the info for it!");

    }

    return eventsChannel.send(subMessage);

}