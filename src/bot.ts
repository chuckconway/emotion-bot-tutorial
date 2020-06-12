import { ConversationState, TurnContext, ActionTypes, ActivityTypes, Attachment } from "botbuilder";
import { DialogSet, DialogContext, WaterfallDialog, WaterfallStepContext, DialogTurnResult, TextPrompt, AttachmentPrompt } from "botbuilder-dialogs";
import { EXIT, Emotion } from "./schema";
import { EmotionDetection } from "@botbuildercommunity/middleware-watson-nlu";
import { getResponse } from "./utils";

export class TheBot {    
    public state: ConversationState;
    public dialogs: DialogSet;

    private addPsychotherapyDialogs() {
        this.dialogs.add(new WaterfallDialog("psychotherapy", [
            async (step: WaterfallStepContext): Promise<DialogTurnResult> => {
                return await this.loopDialog(step)
            }
        ]));
    }

    // private async addAttachmentPrompt(){
    //
    //     const dialogContext: DialogContext = await this.dialogs.createContext(context);
    //     await dialogContext.continueDialog();
    //
    //
    //
    // ]));


   // }

    private addHelloDialogs() {
        this.dialogs.add(new WaterfallDialog("hello", [
            async (step: WaterfallStepContext): Promise<DialogTurnResult> => {
                return await step.prompt("textPrompt", "Hello, how are you doing today?")
            },
            async (step: WaterfallStepContext): Promise<DialogTurnResult> => {
                return await this.loopDialog(step)
            }
        ]));
    }

    private async loopDialog(step: WaterfallStepContext): Promise<DialogTurnResult> {
        if(step.result != null && EXIT.indexOf((<string>step.result).toLowerCase().trim()) != -1) {
            return await step.endDialog();
        }

        const response: string = this.handleEmotion(step.context.turnState.get("emotionDetection"));

        if(response != null){
            return await step.prompt("textPrompt", response);
        }

        return await step.prompt("textPrompt", "Tell me more.");
    }

    private handleEmotion(emotionState: any): string {
        const emotion: Emotion = EmotionDetection.topEmotionScore(emotionState);

        if(emotion.score === 0) {
            return getResponse("none");
        }

        if(EmotionDetection.calculateDifference(emotionState) > 0.3){
            getResponse("unsure");
        }

        return getResponse(emotion.name);

    }

    private addPrompts() {
        this.dialogs.add(new TextPrompt("textPrompt"));
    }

    /**
     *
     */
    constructor(state: ConversationState, dialogs: DialogSet) {        
        this.state = state;
        this.dialogs = dialogs;
        this.addHelloDialogs();
        this.addPsychotherapyDialogs();
        this.addPrompts();
    }

    async onTurn(context: TurnContext): Promise<void> {
        const dialogContext: DialogContext = await this.dialogs.createContext(context);
        await dialogContext.continueDialog();

        if(context.activity.type === ActivityTypes.Message) {
            if(!context.responded){
                if(context.activity.text === "hello"){

                    this.dialogs.add(new AttachmentPrompt("attachmentPrompt"));
                    //this.dialogs.add(new TextPrompt("textPrompt"));

                   const attachmentPrompt = new WaterfallDialog("attachment",[
                        async (step: WaterfallStepContext) => {
                            return await dialogContext.prompt("attachmentPrompt", "Send me a picture!")
                        },
                        async (step: WaterfallStepContext) => {
                            const attachments: any = step.result;

                            await step.prompt("textPrompt", "File recieved, Thank you!");
                            return await dialogContext.endDialog();
                        }
                    ])

                    this.dialogs.add(attachmentPrompt);

                    await dialogContext.beginDialog("attachment");

                //     this.dialogs.add(new WaterfallDialog("attachment", [
                //         async (step: WaterfallStepContext) {
                //             await dialogContext.prompt("attachmentPrompt", "Send me a picture of  your favorite train!");
                //         },
                //         async (step: WaterfallStepContext) {

                //             const attachments: Attachment[] = step.result.value;
                // }))];
                }

            }

            await this.state.saveChanges(context);
        }
    }
}