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
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const schema_1 = require("./schema");
const middleware_watson_nlu_1 = require("@botbuildercommunity/middleware-watson-nlu");
const utils_1 = require("./utils");
class TheBot {
    constructor(state, dialogs) {
        this.state = state;
        this.dialogs = dialogs;
        this.addHelloDialogs();
        this.addPsychotherapyDialogs();
        this.addPrompts();
    }
    addPsychotherapyDialogs() {
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog("psychotherapy", [
            (step) => __awaiter(this, void 0, void 0, function* () {
                return yield this.loopDialog(step);
            })
        ]));
    }
    addHelloDialogs() {
        this.dialogs.add(new botbuilder_dialogs_1.WaterfallDialog("hello", [
            (step) => __awaiter(this, void 0, void 0, function* () {
                return yield step.prompt("textPrompt", "Hello, how are you doing today?");
            }),
            (step) => __awaiter(this, void 0, void 0, function* () {
                return yield this.loopDialog(step);
            })
        ]));
    }
    loopDialog(step) {
        return __awaiter(this, void 0, void 0, function* () {
            if (step.result != null && schema_1.EXIT.indexOf(step.result.toLowerCase().trim()) != -1) {
                return yield step.endDialog();
            }
            const response = this.handleEmotion(step.context.turnState.get("emotionDetection"));
            if (response != null) {
                return yield step.prompt("textPrompt", response);
            }
            return yield step.prompt("textPrompt", "Tell me more.");
        });
    }
    handleEmotion(emotionState) {
        const emotion = middleware_watson_nlu_1.EmotionDetection.topEmotionScore(emotionState);
        if (emotion.score === 0) {
            return utils_1.getResponse("none");
        }
        if (middleware_watson_nlu_1.EmotionDetection.calculateDifference(emotionState) > 0.3) {
            utils_1.getResponse("unsure");
        }
        return utils_1.getResponse(emotion.name);
    }
    addPrompts() {
        this.dialogs.add(new botbuilder_dialogs_1.TextPrompt("textPrompt"));
    }
    onTurn(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const dialogContext = yield this.dialogs.createContext(context);
            yield dialogContext.continueDialog();
            if (context.activity.type === botbuilder_1.ActivityTypes.Message) {
                if (!context.responded) {
                    if (context.activity.text === "hello") {
                        yield dialogContext.beginDialog("hello");
                    }
                    else {
                        yield dialogContext.beginDialog("psychotherapy");
                    }
                }
                yield this.state.saveChanges(context);
            }
        });
    }
}
exports.TheBot = TheBot;
//# sourceMappingURL=bot.js.map