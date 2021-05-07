/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatCommunitySubInfo, ChatSubGiftInfo, UserNotice } from "twitch-chat-client/lib";
import { Client, Message, TextChannel } from "discord.js";
import { CONFIG } from "../globals";

export async function onCommunitySub(
    channel: string,
    user: string,
    subInfo: ChatCommunitySubInfo,
    msg: UserNotice,
    bot: Client
): Promise<Message | Message[] | undefined> {
    if (channel !== `#${CONFIG.twitchUsername}`) return;
    const giftCounts = new Map<string | undefined, number>();

    const eventsChannel = await bot.channels.fetch(CONFIG.eventsChannelID) as TextChannel;

    const previousGiftCount = giftCounts.get(user) ?? 0;
    giftCounts.set(user, previousGiftCount + subInfo.count);
    return eventsChannel.send(`Thanks ${user} for gifting ${subInfo.count} subs to the community!`);

}