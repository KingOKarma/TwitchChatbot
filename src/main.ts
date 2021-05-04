/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { EnvPortAdapter, EventSubListener } from "twitch-eventsub";
import { ApiClient } from "twitch";
import { CONFIG } from "./utils/globals";
import { ClientCredentialsAuthProvider } from "twitch-auth";
import express from "express";

const app = express();

// Set port
// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
const port = process.env.PORT || 8080;
// Routes


const clientId = CONFIG.clientID;
const { clientSecret } = CONFIG;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });
async function initTwitch(): Promise<void> {

    // void await apiClient.helix.eventSub.deleteAllSubscriptions();

    const adapter = new EnvPortAdapter({
        hostName: "twitch-eventsub.herokuapp.com"

    });
    const listener = new EventSubListener(apiClient, adapter,
        "ciW$k&8Q4mue3neEPQ4Q&5mV5p!LpsHw7u55ZaH#X8vBP&YZqMLX%NE45Rph",
        { logger: { minLevel: "debug" } } );

    await listener.applyMiddleware(app).catch(console.error);

    app.listen(port, async () => {
        console.log("App running");
        await listener.resumeExistingSubscriptions();
    });


    console.log("Starting up!");

    const user = await apiClient.helix.users.getUserByName("king_o_karma");
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


}

initTwitch().catch(console.error);
