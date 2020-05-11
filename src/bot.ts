import { ConversationState, TurnContext } from "botbuilder";
import { DialogSet } from "botbuilder-dialogs";

export class TheBot {
    public state: ConversationState;
    public dialogs: DialogSet;

    /**
     *
     */
    constructor(state: ConversationState, dialogs: DialogSet) {        
        this.state = state;
        this.dialogs = dialogs;
    }

    async onTurn(context: TurnContext): Promise<void> {
        
    }
}