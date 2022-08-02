import { Command } from "commander";
import { OpsPipeline } from "./op-queue-pipeline";
export { Command } from "commander";
/**
 *
 */
export declare const commander: Command;
/**
 *
 */
export declare const argParserQ: OpsPipeline;
/**
 *
 */
export declare const argParser: (argv?: string[], parser?: Command, Q?: OpsPipeline) => Promise<import("./pipeline-types").Output>;
/**
 *
 */
export declare const command: (argv?: string[]) => Promise<Command>;
/**
 *
 */
export declare const options: Promise<Command>;
