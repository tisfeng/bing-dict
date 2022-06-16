#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bing_1 = __importDefault(require("./bing"));
const word = process.argv[2];
if (word.trim().length) {
    (0, bing_1.default)(word);
}
else {
    console.error("word is empty");
}
//# sourceMappingURL=index.js.map