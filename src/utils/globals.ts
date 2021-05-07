import BlockedUsers from "./blockedUsers";
import Config from "./config";

export const CONFIG = Config.getConfig();
export const USERS = BlockedUsers.getConfig();