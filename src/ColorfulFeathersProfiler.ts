import { FeathersError } from '@feathersjs/errors';
import { Application, HookContext, ServiceMethods } from '@feathersjs/feathers';
import Chalk from 'chalk';
import { assignColor } from './Utilities/ColorPicker';
import { getPending, profiler as FeathersProfiler, ProfilerContext, timestamp } from 'feathers-profiler';

export default function ColorfulFeathersProfiler({ enabled = true, logger = console, logStyle = 'string' }: ProfilerOptions = {}) {
    return (App: Application) => {
        if (!enabled) {
            logger.warn('ColorfulFeathersProfiler has been disabled!')
        }
        
        const profiler = FeathersProfiler({
            logger,
            logMsg(hook) {
                const parser = new Parser(hook);
                
                if (logStyle === 'object') {
                    return new ObjectLogFormatter(parser).format();
                }
                
                return new StringLogFormatter(parser).format();
            },
        })
        
        return App.configure(profiler);
    }
}

class Parser {
    protected base: Pick<ParsedContext, 'provider' | 'error' | 'method' | 'route' | 'hook' | 'duration'>;
    
    constructor(protected readonly hook: ProfilerContext) {
        this.base = {
            provider: hook.params.provider || 'server',
            error: hook.error,
            method: hook.method,
            route: hook._log.route.replace(/^\/*/, '/'),
            duration: Math.round(hook._log.elapsed / 1e5) / 10,
            hook: {
                type: hook.original?.type || hook.type
            },
        }
    };
    
    public get data(): ParsedContext {
        return {
            ...this.base,
            statusCode: this.statusCode,
            level: this.level,
        }
    }
    
    protected get level(): ParsedContext['level'] {
        return this.base.error ? 'error' : 'info';
    }
    
    protected get statusCode(): ParsedContext['statusCode'] {
        const { error, statusCode } = this.hook;
        
        if (statusCode) {
            return statusCode;
        }
    
        if (error) {
            return error.statusCode || 500;
        }
    
        return 200;
    }
    
}

class ObjectLogFormatter implements Formatter<ObjectLog> {
    constructor(protected readonly parser: Parser) {}
    
    public format(): ObjectLog {
        const data = this.parser.data;
        return {
            ...data,
            message: `${data.method.toString().toUpperCase()} ${data.route} [${data.provider}]`
        }
    }
}

class StringLogFormatter implements Formatter<string> {
    constructor(protected readonly parser: Parser) {}
    
    public format(): string {
        const data: ColorizedContext = Object.assign({}, this.parser.data);
    
        if (data.provider !== 'server') {
            data.provider = Chalk.yellowBright(data.provider);
            data.route = assignColor(data.route);
        }
    
        let time = `${timestamp()}`
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

interface ParsedContext {
    level: 'info' | 'error';
    duration: number;
    route: string;
    provider: 'server' | 'rest' | 'socketio' | string;
    method: keyof ServiceMethods<any>;
    hook: {
        type: 'before' | 'after' | 'error';
    };
    error?: Error | FeathersError;
    statusCode?: number;
}

interface ObjectLog extends ColorizedContext {
    message: string;
}

interface Formatter<Format> {
    format(): Format;
}

type ColorizedContext = {
    [key in keyof ParsedContext as key & string]: ParsedContext[key] extends string ? string : ParsedContext[key];
}

/**
 * Pending requests.
 */
let pending = 0;

interface ProfilerOptions {
    enabled?: boolean;
    logger?: CompatibleLogger;
    logStyle?: 'object' | 'string';
}


type CompatibleLogger = Record<'log' | 'warn' | 'error', LogFunction>;
type LogFunction = (message: any) => void;