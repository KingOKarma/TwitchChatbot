import { dump, load } from "js-yaml";
import { USERS } from "./globals";
import fs from "fs";

/**
 * This represents the blockedUsers.yml
 * @class BlockedUsers
 * @property {string} blocked

 */
export default class BlockedUsers {
    private static readonly _configLocation = "./blockedUsers.yml";

    public readonly blocked: string[];

    private constructor() {
        this.blocked = [""];

    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): BlockedUsers {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!fs.existsSync(BlockedUsers._configLocation)) {
            throw new Error("Please create a blockedUsers.yml");
        }
        const fileContents = fs.readFileSync(
            BlockedUsers._configLocation,
            "utf-8"
        );
        const casted = load(fileContents) as BlockedUsers;

        return casted;
    }

    /**
   *  Safe the config to the congfig.yml default location
   */
    public static saveConfig(): void {
        fs.writeFileSync(BlockedUsers._configLocation, dump(USERS));
    }
}