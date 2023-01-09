import Chalk from 'chalk';
import { getPending, timestamp } from 'feathers-profiler';
import { assignColor } from '../Utilities/ColorPicker';
import { Parser } from '../Utilities/ContextParser';
import { Formatter } from './FormatterContract';
import { ColorizedContext } from './ObjectLogFormatter';

/**
 * Formats the profiler log as a string.
 *
 * @example log
 * `20:49:12 /my-test-service::get (server) 3.7 ms - 0 pending`
 */
export class StringLogFormatter implements Formatter<string> {
    constructor(protected readonly parser: Parser) {
    }
    
    public format(): string {
        const data: ColorizedContext = Object.assign({}, this.parser.data);
        
        if (data.provider !== 'server') {
            data.provider = Chalk.yellowBright(data.provider);
            data.route = assignColor(data.route);
        }
        
        let time = `${timestamp()}`;
        let header = `${data.route}::${data.method}`;
        let trailer = `(${data.provider}) ${data.durationMs} ms - ${getPending()} pending`;
        let error = '';
        
        if (data.error) {
            error = `\n [${data.hook.type}: ${data.method}]\n   ${data.error.stack || ''}`;
            header = Chalk.red(`[ERROR] ${header}`);
        }
        
        return `${time} ${header} ${trailer} ${error}`;
    }
}