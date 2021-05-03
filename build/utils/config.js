"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const js_yaml_1 = require("js-yaml");
const globals_1 = require("./globals");
const fs_1 = __importDefault(require("fs"));
/**
 * This represents the config.yml
 * @class Config
 * @property {string} accessToken
 * @property {string} userID
 */
class Config {
    constructor() {
        this.accessToken = "";
        this.clientID = "";
        this.clientSecret = "";
    }
    /**
       *  Call getConfig instead of constructor
       */
    static getConfig() {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!fs_1.default.existsSync(Config._configLocation)) {
            throw new Error("Please create a config.yml");
        }
        const fileContents = fs_1.default.readFileSync(Config._configLocation, "utf-8");
        const casted = js_yaml_1.load(fileContents);
        return casted;
    }
    /**
   *  Safe the config to the congfig.yml default location
   */
    static saveConfig() {
        fs_1.default.writeFileSync(Config._configLocation, js_yaml_1.dump(globals_1.CONFIG));
    }
}
exports.default = Config;
Config._configLocation = "./config.yml";
