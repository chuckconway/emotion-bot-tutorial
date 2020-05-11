"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const dotenv_1 = require("dotenv");
const botbuilder_1 = require("botbuilder");
const middleware_watson_nlu_1 = require("@botbuildercommunity/middleware-watson-nlu");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const bot_1 = require("./bot");
dotenv_1.config();
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});
const adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
adapter.onTurnError = (context, error) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(`Sorry an error has occured: ${error}`);
    context.sendActivity("Sorry, an error has occured.");
});
adapter.use(new middleware_watson_nlu_1.EmotionDetection(process.env.WATSON_API_KEY, process.env.WATSON_ENDPOINT));
const conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
const dialogs = new botbuilder_dialogs_1.DialogSet(conversationState.createProperty("dialogState"));
const bot = new bot_1.TheBot(conversationState, dialogs);
server.post("/api/messages", (req, res) => {
    adapter.processActivity(req, res, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield bot.onTurn(context);
    }));
});
//# sourceMappingURL=app.js.map