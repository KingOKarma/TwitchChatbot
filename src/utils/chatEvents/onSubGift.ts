/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatSubGiftInfo, UserNotice } from "twitch-chat-client/lib";
import { Client, Message, TextChannel } from "discord.js";
import { CONFIG } from "../globals";

export async function onSubGift(
    channel: string,
    user: string,
    subInfo: ChatSubGiftInfo,
    msg: UserNotice,
    bot: Client
): Promise<Message | Message[] | undefined> {
    if (channel !== `#${CONFIG.twitchUsername}`) return;
    const giftCounts = new Map<string | undefined, number>();

    const eventsChannel = await bot.channels.fetch(CONFIG.eventsChannelID) as TextChannel;

    const giftingUser = subInfo.gifter;
    const previousGiftCount = giftCounts.get(giftingUser) ?? 0;
    if (previousGiftCount > 0) {
        giftCounts.set(giftingUser, previousGiftCount - 1);
    } else {
        return eventsChannel.send(`Thanks ${giftingUser} for gifting a sub to ${user}!`);
    }

}