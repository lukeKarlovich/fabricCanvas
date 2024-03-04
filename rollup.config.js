import dotenv from 'rollup-plugin-dotenv';
import { sourcePath } from "./node_modules/@mendix/pluggable-widgets-tools/configs/shared";
import { yellow } from "ansi-colors";
import { relative } from "path";
export default async args => {
    args.configDefaultConfig.forEach(e => {
        e.plugins.push(dotenv());
        const onwarn = e.onwarn;
        e.onwarn = (warning) => {
            if ('MODULE_LEVEL_DIRECTIVE' === warning.code){
                console.warn(yellow((warning.plugin ? `(${warning.plugin} plugin) ` : "") +
                (warning.loc
                    ? `${relative(sourcePath, warning.loc.file)} (${warning.loc.line}:${warning.loc.column}) `
                    : "") +
                `Error: ${warning.message}` +
                (warning.frame ? warning.frame : "")));
            } else {
                onwarn(warning);
            }
        }
    });
    return args.configDefaultConfig;
}