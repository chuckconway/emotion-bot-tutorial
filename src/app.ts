import * as restify from "restify";
import { config } from "dotenv";
import { BotFrameworkAdapter, TurnContext, ConversationState, MemoryStorage } from "botbuilder";
import { EmotionDetection } from "@botbuildercommunity/middleware-watson-nlu"
import { MemoryScope, DialogSet } from "botbuilder-dialogs";
import { TheBot } from "./bot";

config();

const server: restify.Server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter: BotFrameworkAdapter = new BotFrameworkAdapter({
    appId:process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

adapter.onTurnError = async (context: TurnContext, error: Error) => {
    console.error(`Sorry an error has occured: ${error}`);
    context.sendActivity("Sorry, an error has occured.");    
};

adapter.use(new EmotionDetection(process.env.WATSON_API_KEY, process.env.WATSON_ENDPOINT));

const conversationState: ConversationState = new ConversationState(new MemoryStorage());
const dialogs: DialogSet = new DialogSet(conversationState.createProperty("dialogState"));

const bot: TheBot = new TheBot(conversationState, dialogs);

server.post("/api/messages", (req:restify.Request, res:restify.Response): void => {
    adapter.processActivity(req, res, async(context: TurnContext): Promise<void> => {
        await bot.onTurn(context)
    });
});
