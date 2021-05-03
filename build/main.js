"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const twitch_eventsub_1 = require("twitch-eventsub");
const twitch_1 = require("twitch");
const globals_1 = require("./utils/globals");
const twitch_auth_1 = require("twitch-auth");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
dotenv_1.default.config();
const app = express_1.default();
// Set port
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const port = process.env.PORT !== null || 8080;
// Routes
const clientId = globals_1.CONFIG.clientID;
const { clientSecret } = globals_1.CONFIG;
const authProvider = new twitch_auth_1.ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new twitch_1.ApiClient({ authProvider });
async function initTwitch() {
    void await apiClient.helix.eventSub.deleteAllSubscriptions();
    const adapter = new twitch_eventsub_1.MiddlewareAdapter({
        hostName: "twitch-eventsub.herokuapp.com"
    });
    const listener = new twitch_eventsub_1.EventSubListener(apiClient, adapter, "ciW$k&8Q4mue3neEPQ4Q&5mV5p!LpsHw7u55ZaH#X8vBP&YZqMLX%NE45Rph", { logger: { minLevel: "debug" } });
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
