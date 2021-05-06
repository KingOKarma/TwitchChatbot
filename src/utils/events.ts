/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { ClientCredentialsAuthProvider, StaticAuthProvider } from "twitch-auth";
import { EventSubListener, ReverseProxyAdapter } from "twitch-eventsub";
import { ApiClient } from "twitch";
import { CONFIG } from "./globals";
import { ChatClient } from "twitch-chat-client";
import { NgrokAdapter } from "twitch-eventsub-ngrok";
import { TwitchPrivateMessage } from "twitch-chat-client/lib/StandardCommands/TwitchPrivateMessage";
import cron from "cron";


const { clientID } = CONFIG;
const { clientSecret } = CONFIG;
const { botAccessToken } = CONFIG;
let { prefix } = CONFIG;


if (CONFIG.prefix !== "") {
    prefix = "!";

}


const authProvider = new ClientCredentialsAuthProvider(clientID, clientSecret);
const authChatProvider = new StaticAuthProvider(clientID, botAccessToken);

const apiClient = new ApiClient({ authProvider });


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

    const user = await apiClient.helix.users.getUserByName(CONFIG.twitchUsername);
    if (user === null) {
        throw new Error("Please enter a valid Twitch username in the config.yml");
    }


    const userId = user.id;
    await listener.subscribeToChannelUpdateEvents(userId, async (channel) => {
        console.log(`${channel.broadcasterDisplayName} Has set the new stream title to: "${channel.streamTitle}"`);
    });

    await listener.subscribeToStreamOfflineEvents(userId, (channel) => {
        console.log(`${channel.broadcasterDisplayName} just went offline`);
    });

    await listener.subscribeToChannelFollowEvents(userId, (channel) => {
        console.log(`${channel.userDisplayName} has just followed!`);
    });

    await listener.subscribeToChannelSubscriptionEvents(userId, (channel) => {

        let subMessage;

        switch (channel.tier) {
            case "1000":
                subMessage = `${channel.userDisplayName} Is now a tier 1 Sub!`;
                break;


            case "2000":
                subMessage = `${channel.userDisplayName} Is now a tier 2 Sub!`;
                break;


            case "3000":
                subMessage = `${channel.userDisplayName} Is now a tier 3 Sub!`;
                break;
        }

        if (channel.isGift) {
            subMessage.concat(" (This was a gift!)");
        }


        console.log(subMessage);
    }
    );

    await listener.subscribeToChannelCheerEvents(userId, (channel) => {
        switch (channel.isAnonymous) {
            case true:
                console.log(`An anonymous user has just cheered ${channel.bits} PogChamp \n\n ${channel.message}`);
                break;

            case false:
                console.log(`${channel.userDisplayName} has just cheered ${channel.bits} PogChamp \n\n ${channel.message}`);
                break;
        }
    });

    await listener.subscribeToChannelRaidEventsTo(userId, (channel) => {
        console.log(`${channel.raidingBroadcasterDisplayName} is raiding with ${channel.viewers} viewers!`);
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
                await listener.listen().catch(console.error);
            }
            console.log(subObject);
        });
    });
    console.log("After job instantiation");
    job.start();

}

/**
 * Initialise the Twitch Chat Client
 */
export async function intiChatClient(): Promise<void> {
    const chatClient = new ChatClient(authChatProvider, { channels: [CONFIG.twitchUsername] });
    // Listen to more events...
    await chatClient.connect();

    chatClient.onMessage(async (channel: string, user: string, message: string, msg: TwitchPrivateMessage) => {


        // Handler
        const args = message.slice(prefix.length).trim().split(/ +/g);

        const cmd = args.shift()?.toLowerCase();

        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const commandFile = require(`../commands/${cmd}.js`);
            commandFile.run(chatClient, channel, user, message, msg, args);

        } catch (err) {

        }

    });
}

