import * as restify from "restify";
import {config} from "dotenv";
import { BotFrameworkAdapter, TurnContext } from "botbuilder";

config();

const server: restify.Server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`${server.name} listening to ${server.url}`);
});

const adapter: BotFrameworkAdapter = new BotFrameworkAdapter({
    appId:process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.post("/api/messages", (req:restify.Request, res:restify.Response): void => {
    adapter.processActivity(req, res, async(context:TurnContext): Promise<void> => {
        await context.sendActivity('Hi!');
    });
});
