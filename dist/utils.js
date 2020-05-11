"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("./schema");
function getResponse(emotion) {
    const e = schema_1.RESPONSES[emotion];
    let result = null;
    if (e != null) {
        const random = Math.trunc(Math.random() * e.length);
        result = e[random];
    }
    return result;
}
exports.getResponse = getResponse;
//# sourceMappingURL=utils.js.map