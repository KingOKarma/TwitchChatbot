"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const twitch_1 = require("twitch");
const globals_1 = require("./utils/globals");
const twitch_auth_1 = require("twitch-auth");
const twitch_eventsub_1 = require("twitch-eventsub");
const twitch_eventsub_ngrok_1 = require("twitch-eventsub-ngrok");
const clientId = globals_1.CONFIG.clientID;
const { clientSecret } = globals_1.CONFIG;
const authProvider = new twitch_auth_1.ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new twitch_1.ApiClient({ authProvider });
void apiClient.helix.eventSub.deleteAllSubscriptions();
const listener = new twitch_eventsub_1.EventSubListener(apiClient, new twitch_eventsub_ngrok_1.NgrokAdapter(), "ciW$k&8Q4mue3neEPQ4Q&5mV5p!LpsHw7u55ZaH#X8vBP&YZqMLX%NE45Rph");
listener.listen().catch(console.error);
// Void apiClient.helix.eventSub.deleteAllSubscriptions();
console.log("Starting up!");
const userId = "192135643";
async function initTwitch() {
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
    });
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
