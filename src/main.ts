import { intiChatClient, intiEventSub } from "./utils/events";

intiEventSub().catch(console.error);

intiChatClient().catch(console.error);