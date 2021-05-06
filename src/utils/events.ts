/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { EventSubListener, ReverseProxyAdapter } from "twitch-eventsub";
import { ApiClient } from "twitch";
import { CONFIG } from "./globals";
import { ClientCredentialsAuthProvider } from "twitch-auth";
import { NgrokAdapter } from "twitch-eventsub-ngrok";
import cron from "cron";


/**
 * Initialise  the Eventsub
 */
export async function intiEventSub(): Promise<void> {

    const clientId = CONFIG.clientID;
    const { clientSecret } = CONFIG;

    const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
    const apiClient = new ApiClient({ authProvider });
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
    console.log(subs);
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