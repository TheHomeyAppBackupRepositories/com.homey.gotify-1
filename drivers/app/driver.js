"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const homey_1 = __importDefault(require("homey"));
const axios_1 = __importDefault(require("axios"));
class Driver extends homey_1.default.Driver {
    /**
     * onInit is called when the driver is initialized.
     */
    async onInit() {
        this.log('MyDriver has been initialized');
        const cardActionSendMessage = this.homey.flow.getActionCard('send-message');
        cardActionSendMessage.registerRunListener(async (args) => {
            const { title } = args;
            const { message } = args;
            const { priority } = args;
            const { device } = args;
            const bodyFormData = {
                title: title,
                message: message,
                priority: priority,
            };
            (0, axios_1.default)({
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                url: await device.getServerUrl() + "/message?token=" + await device.getToken(),
                data: bodyFormData,
            })
                .then(function (response) { console.log(response.data); })
                .catch(function (error) { console.error(error); });
        });
    }
    async onPair(session) {
        // Show a specific view by ID
        await session.showView("app_settings");
        // Show the next view
        await session.nextView();
        // Show the previous view
        await session.prevView();
        // Close the pair session
        await session.done();
        // Received when a view has changed
        session.setHandler("showView", async function (viewId) {
            console.log("View: " + viewId);
        });
    }
}
module.exports = Driver;
