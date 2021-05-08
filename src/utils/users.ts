import { dump, load } from "js-yaml";
import { USERS } from "./globals";
import fs from "fs";

/**
 * This represents the blockedUsers.yml
 * @class BlockedUsers
 * @property {string[]} autoMsgs
 * @property {string[]} blocked
 * @property {boolean} canSendMessage
 * @property {string[]} customCommands

 */
export default class Users {
    private static readonly _configLocation = "./users.yml";

    public autoMsgs: string[];

    public blocked: string[];

    public canSendMessage: boolean;

    public customCommands: string[];

    private constructor() {
        this.autoMsgs = [""];
        this.blocked = [""];
        this.canSendMessage = false;
        this.customCommands = [""];

    }

    /**
       *  Call getConfig instead of constructor
       */
    public static getConfig(): Users {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!fs.existsSync(Users._configLocation)) {
            throw new Error("Please create a users.yml");
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