import { ParsedContext, Parser } from '../Utilities/ContextParser';
import { Formatter } from './FormatterContract';

export class ObjectLogFormatter implements Formatter<ObjectLog> {
    constructor(protected readonly parser: Parser) {
    }
    
    public format(): ObjectLog {
        const data = this.parser.data;
        return {
            ...data,
            message: `${data.method.toString().toUpperCase()} ${data.route} [${data.provider}]`,
        };
    }
}

interface ObjectLog extends ColorizedContext {
    message: string;
}

export type ColorizedContext = {
    [key in keyof ParsedContext as key & string]: ParsedContext[key] extends string ? string : ParsedContext[key];
}