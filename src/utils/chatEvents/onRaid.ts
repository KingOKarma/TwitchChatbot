/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatRaidInfo, UserNotice } from "twitch-chat-client/lib";
import { Client, Message, TextChannel } from "discord.js";
import { CONFIG } from "../globals";

export async function onRaid(
    channel: string,
    user: string,
    raidInfo: ChatRaidInfo,
    msg: UserNotice,
    bot: Client
): Promise<Message | Message[] | undefined> {
    if (channel !== `#${CONFIG.twitchUsername}`) return;
    const eventsChannel = await bot.channels.fetch(CONFIG.eventsChannelID) as TextChannel;
    return eventsChannel.send(`${raidInfo.displayName} is raiding with ${raidInfo.viewerCount} viewers!`);


}