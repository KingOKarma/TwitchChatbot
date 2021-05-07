/* eslint-disable @typescript-eslint/no-unused-vars */
import { Client, Message, TextChannel } from "discord.js";
import { CONFIG } from "../globals";

export async function onHosted(
    channel: string,
    byChannel: string,
    auto: boolean,
    viewers: number | undefined,
    bot: Client
): Promise<Message | Message[] | undefined> {
    if (channel !== `#${CONFIG.twitchUsername}`) return;
    const eventsChannel = await bot.channels.fetch(CONFIG.eventsChannelID) as TextChannel;

    let hostMsg = `${byChannel} has just hosted with ${viewers}`;
    if (auto) {
        hostMsg = `${byChannel} has just auto hosted with ${viewers}`;
    }

    return eventsChannel.send(hostMsg);

}