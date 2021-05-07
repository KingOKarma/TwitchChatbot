import { dump, load } from "js-yaml";
import { USERS } from "./globals";
import fs from "fs";

/**
 * This represents the blockedUsers.yml
 * @class BlockedUsers
 * @property {string} blocked
 * @property {boolean} canSendMessage

 */
export default class Users {
    private static readonly _configLocation = "./users.yml";

    public blocked: string[];

    public canSendMessage: boolean;

    private constructor() {
        this.blocked = [""];
        this.canSendMessage = false;

    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): Users {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!fs.existsSync(Users._configLocation)) {
            throw new Error("Please create a blockedUsers.yml");
        }
        const fileContents = fs.readFileSync(
            Users._configLocation,
            "utf-8"
        );
        const casted = load(fileContents) as Users;

        return casted;
    }

    /**
   *  Safe the config to the congfig.yml default location
   */
    public static saveConfig(): void {
        fs.writeFileSync(Users._configLocation, dump(USERS));
    }
}