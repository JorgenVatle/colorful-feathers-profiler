import Chalk from 'chalk';
import { getPending, timestamp } from 'feathers-profiler';
import { assignColor } from '../ColorPicker';
import { Parser } from '../ContextParser';
import { Formatter } from './FormatterContract';
import { ColorizedContext } from './ObjectLogFormatter';

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
        let trailer = `(${data.provider}) ${data.duration} ms - ${getPending()} pending`;
        let error = '';
        
        if (data.error) {
            error = `\n [${data.hook.type}: ${data.method}]\n   ${data.error.stack || ''}`;
            header = Chalk.red(`[ERROR] ${header}`);
        }
        
        return `${time} ${header} ${trailer} ${error}`;
    }
}