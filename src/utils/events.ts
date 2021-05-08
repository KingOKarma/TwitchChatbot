/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { CONFIG, USERS } from "./globals";
import { Client, TextChannel } from "discord.js";
import { ClientCredentialsAuthProvider, StaticAuthProvider } from "twitch-auth";
import { EventSubListener, ReverseProxyAdapter } from "twitch-eventsub";
import { ApiClient } from "twitch";
import { ChatClient } from "twitch-chat-client";
import { NgrokAdapter } from "twitch-eventsub-ngrok";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import Users from "./users";
import cron from "cron";
import { onCommunitySub } from "./chatEvents/onCommunitySub";
import { onHosted } from "./chatEvents/onHosted";
import { onRaid } from "./chatEvents/onRaid";
import { onReSub } from "./chatEvents/onReSub";
import { onSub } from "./chatEvents/onSub";
import { onSubGift } from "./chatEvents/onSubGift";


const bot = new Client();

bot.on("ready", () => {
    console.log(`${bot.user?.tag} is online and ready!`);
});

void bot.login(CONFIG.botToken);


const { clientID } = CONFIG;
const { clientSecret } = CONFIG;
const { botAccessToken } = CONFIG;
const { accessToken } = CONFIG;
let { prefix } = CONFIG;


if (CONFIG.prefix !== "") {
    prefix = "!";
}


const authProvider = new ClientCredentialsAuthProvider(clientID, clientSecret);
const authChatProvider = new StaticAuthProvider(clientID, botAccessToken);
const authUserChatProvider = new StaticAuthProvider(clientID, accessToken);

const apiClient = new ApiClient({ authProvider });
let sentMessage = false;


/**
 * Initialise the Eventsub
 */
export async function intiEventSub(): Promise<void> {


    await apiClient.helix.eventSub.deleteAllSubscriptions();

    let adapter = undefined;

    switch (CONFIG.environment.toLowerCase()) {

        case "dev": {
            console.log("Running on Local/Developemnt environment");
            adapter = new NgrokAdapter();
            break;
        }

        case "production": {
            console.log("Running on Production server");
            adapter = new ReverseProxyAdapter({
                externalPort: 443,
                hostName: CONFIG.productionHostname,
                port: CONFIG.proudctionPort

            });
            break;
        }
    }

    if (adapter === undefined) {
        throw new Error("In config.yml please put in the environment parameter either \"dev\" or \"production\"");
    }


    const listener = new EventSubListener(apiClient, adapter,
        "ciW$k&8Q4mue3neEPQ4Q&5mV5p!LpsHw7u55ZaH#X8vBP&YZqMLX%NE45Rph",
        { logger: { minLevel: "debug" } } );

    await listener.listen().catch(console.error);

    console.log("Starting up!");

    const eventsChannel = await bot.channels.fetch(CONFIG.eventsChannelID) as TextChannel;

    const user = await apiClient.helix.users.getUserByName(CONFIG.twitchUsername);
    if (user === null) {
        throw new Error("Please enter a valid Twitch username in the config.yml");
    }


    const userId = user.id;
    await listener.subscribeToChannelUpdateEvents(userId, async (channel) => {
        console.log(`${channel.broadcasterDisplayName} Has set the new stream title to: "${channel.streamTitle}"`);
    });

    await listener.subscribeToStreamOfflineEvents(userId, (channel) => {
        USERS.canSendMessage = false;
        Users.saveConfig();
        console.log(`${channel.broadcasterDisplayName} just went offline`);
        sentMessage = false;

    });

    await listener.subscribeToStreamOnlineEvents(userId, (channel) => {
        USERS.canSendMessage = true;
        Users.saveConfig();
        console.log(`${channel.broadcasterDisplayName} just went online`);
    });

    await listener.subscribeToChannelFollowEvents(userId, async (channel) => {
        return eventsChannel.send(`${channel.userDisplayName} has just followed!`);
    });

    await listener.subscribeToChannelCheerEvents(userId, async (channel) => {
        switch (channel.isAnonymous) {
            case true:
                return eventsChannel.send(`An anonymous user has just cheered ${channel.bits} PogChamp \n\n ${channel.message}`);

            case false:
                return eventsChannel.send(`${channel.userDisplayName} has just cheered ${channel.bits} PogChamp \n\n ${channel.message}`);
        }
    });


    console.log("All Notif requests have been initialised successfully");
    const subs = (await apiClient.helix.eventSub.getSubscriptions()).data;
    // Everyday at midnight
    const job = new cron.CronJob("00 00 00 * * *", () => {
        const d = new Date();
        console.log("Midnightly check:", d);

        subs.forEach(async (sub) => {
            const subObject = {
                condition: sub.condition,
                creationDate: sub.creationDate,
                id: sub.id,
                status: sub.status,
                type: sub.type

            };
            if (subObject.status !== "enabled") {
                await apiClient.helix.eventSub.deleteAllSubscriptions();
                await listener.listen().catch(console.error);
            }
            console.log(subObject);
        });
    });
    job.start();

}

function getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}


/**
 * Initialise the Twitch Chat Client
 */
export async function intiChatClient(): Promise<void> {
    const chatClient = new ChatClient(authChatProvider, { channels: [CONFIG.twitchUsername] });
    const userChatClient = new ChatClient(authUserChatProvider, { channels: [CONFIG.twitchUsername] });
    // Listen to more events...
    await chatClient.connect();
    await userChatClient.connect();

    const stream = await apiClient.helix.streams.getStreamByUserName(CONFIG.twitchUsername);

    if (stream === null) {
        USERS.canSendMessage = true;
        Users.saveConfig();
    }

    // Const ranNum = getRandomNumber(600000, 900000);
    const ranNum = getRandomNumber(60000, 120000);

    setInterval(() => {
        if (sentMessage) {
            if (USERS.autoMsgs.length === 0) {
                void chatClient.say(`#${CONFIG.twitchUsername}`,
                    "That autoMessage list is empty! You can fill it up with !addauto <message>");
                sentMessage = false;
                return;

            }
            const autoMSG = USERS.autoMsgs[Math.floor(Math.random() * USERS.autoMsgs.length)];

            void chatClient.say(`#${CONFIG.twitchUsername}`, autoMSG);
            sentMessage = false;

        }

    }, ranNum);


    chatClient.onMessage(async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {
        if (user === CONFIG.botUsername) return;

        if (USERS.canSendMessage) {
            if (USERS.blocked.some((check) => check === user)) {
            } else if (message.startsWith(prefix)) {
            } else {
                const discordChannel = await bot.channels.fetch(CONFIG.discordChatChannelID) as TextChannel;
                void discordChannel.send(`**${user} :** ${message}`);


            }
        }

        if (USERS.canSendMessage) {
            sentMessage = true;
        }

        USERS.customCommands.forEach((ccContent) => {

            const messages = ccContent.split(" ");
            const last = messages[messages.length - 1];

            if (message.startsWith(`${CONFIG.prefix}${last}`)) {
                messages.pop();
                return chatClient.say(channel, messages.join(" "));
            }

        });


        const args = message.slice(prefix.length).trim().split(/ +/g);

        const cmd = args.shift()?.toLowerCase();

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const commandFile = require(`../commands/${cmd}.js`);
            commandFile.run(chatClient, channel, user, message, msg, args);

        } catch (err) {

        }
    });

    chatClient.onCommunitySub(async (
        channel,
        user,
        subInfo,
        msg
    ) => onCommunitySub(channel, user, subInfo, msg, bot));

    chatClient.onSubGift(async (
        channel,
        user,
        subInfo,
        msg
    ) => onSubGift(channel, user, subInfo, msg, bot));

    chatClient.onResub(async (
        channel,
        user,
        subInfo,
        msg
    ) => onReSub(channel, user, subInfo, msg, bot));

    chatClient.onSub(async (
        channel,
        user,
        subInfo,
        msg
    ) => onSub(channel, user, subInfo, msg, bot));

    userChatClient.onHosted(async (
        channel,
        byChannel,
        auto,
        viewers
    ) => onHosted(channel, byChannel, auto, viewers, bot));

    chatClient.onRaid(async (
        channel,
        user,
        raidInfo,
        msg
    ) => onRaid(channel, user, raidInfo, msg, bot));

}

/**
 * Checks if user has perms to use bot commands
   * @param {TwitchPrivateMessage} msg Message instance
 */
export function checkPerms(msg: TwitchPrivateMessage): boolean {
    let hasperms = false;

    if (msg.userInfo.isBroadcaster) {
        hasperms = true;
    }

    if (msg.userInfo.isMod) {
        hasperms = true;
    }

    return hasperms;

}

