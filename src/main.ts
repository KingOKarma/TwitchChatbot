import { EventSubListener, ReverseProxyAdapter } from "twitch-eventsub";
import { ApiClient } from "twitch";
import { CONFIG } from "./utils/globals";
import { ClientCredentialsAuthProvider } from "twitch-auth";
// Import { NgrokAdapter } from "twitch-eventsub-ngrok";


const clientId = CONFIG.clientID;
const { clientSecret } = CONFIG;

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

const listener = new EventSubListener(apiClient, new ReverseProxyAdapter({
    externalPort: 443, // The external port (optional, defaults to 443)
    hostName: "api.bucketbot.dev" // The host name the server is available from

}), "ciW$k&8Q4mue3neEPQ4Q&5mV5p!LpsHw7u55ZaH#X8vBP&YZqMLX%NE45Rph");
listener.listen().catch(console.error);

// Void apiClient.helix.eventSub.deleteAllSubscriptions();

console.log("Starting up!");
const userId = "192135643";

async function initTwitch(): Promise<void> {

    await listener.subscribeToChannelUpdateEvents(userId, (e) => {
        console.log(`${e.broadcasterDisplayName} Has set the new stream title to: "${e.streamTitle}"`);
    }).catch(console.error);

    await listener.subscribeToStreamOfflineEvents(userId, (e) => {
        console.log(`${e.broadcasterDisplayName} just went offline`);
    });

    console.log("All Notif requests have been initialised successfully");

}

initTwitch().catch(console.error);
