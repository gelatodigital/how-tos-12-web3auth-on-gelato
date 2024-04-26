import { Buffer } from "buffer";
import process from "process";

window.global = globalThis;
globalThis.Buffer = globalThis.Buffer || Buffer;
console.log(process.env)
console.log(globalThis.process?.env)
let globalPr = globalThis.process?.env ? {} : globalThis.process?.env
// process.env = { ...process.env };
globalThis.process = process;
//export {}