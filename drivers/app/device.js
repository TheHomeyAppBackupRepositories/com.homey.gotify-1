"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const homey_1 = __importDefault(require("homey"));
const https_1 = __importDefault(require("https"));
class AppDevice extends homey_1.default.Device {
    constructor() {
        super(...arguments);
        this.axiosInstance = axios_1.default.create({
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: false
            })
        });
    }
    /**
     * onInit is called when the device is initialized.
     */
    async onInit() {
        this.settings = this.getSettings();
        this.log(this.settings.name + ' has been initialized');
        let device_urlNotValid = true;
        let device_unavailable = false;
        let availability_interval = setInterval(async () => {
            try {
                let url = await new URL(await this.getServerUrl());
                device_urlNotValid = false;
                await this.setAvailable();
            }
            catch (error) {
                if (!device_urlNotValid) {
                    device_urlNotValid = true;
                    await this.setUnavailable(this.homey.__('device_url') + await this.getServerUrl() + this.homey.__('device_notValid'));
                }
            }
            if (!device_urlNotValid) {
                let promise = await this.axiosInstance({
                    method: "get",
                    url: await this.getServerUrl(),
                    data: "",
                    timeout: 5 * 1000,
                })
                    .then((response) => {
                    if (response.status == 200) {
                        device_unavailable = false;
                    }
                    else {
                        device_unavailable = true;
                    }
                    ;
                })
                    .catch((error) => {
                    //console.error({ error });
                    device_unavailable = true;
                });
                if (device_unavailable) {
                    await this.setUnavailable(this.homey.__('device_unavailable'));
                }
                else {
                    await this.setAvailable();
                }
            }
        }, 5 * 1000);
    }
    /**
     * onAdded is called when the user adds the device, called just after pairing.
     */
    async onAdded() {
        this.log(this.getSettings().name + ' has been added');
    }
    /**
     * onSettings is called when the user updates the device's settings.
     * @param {object} event the onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string|void>} return a custom message that will be displayed
     */
    async onSettings({ oldSettings: {}, newSettings: {}, changedKeys: [] }) {
        this.log(this.getSettings().name + ' settings where changed');
    }
    /**
     * onRenamed is called when the user updates the device's name.
     * This method can be used this to synchronise the name to the device.
     * @param {string} name The new name
     */
    async onRenamed(name) {
        this.log(this.getSettings().name + ' was renamed');
    }
    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted() {
        this.log(this.getSettings().name + ' has been deleted');
    }
    async getServerUrl() {
        return this.settings.url;
    }
    async getToken() {
        return this.settings.token;
    }
}
module.exports = AppDevice;
