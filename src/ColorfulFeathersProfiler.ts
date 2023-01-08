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
                const context = new Parser(hook).logObject;
    
                if (logStyle === 'object') {
                    return context;
                }
    
                if (context.provider !== 'server') {
                    context.provider = Chalk.yellowBright(context.provider);
                    context.route = assignColor(context.route);
                }
    
                let time = `${timestamp()}`
                let header = `${context.route}::${context.method}`;
                let trailer = `(${context.provider}) ${context.duration} ms - ${getPending()} pending`;
                let error = '';
    
                if (context.error) {
                    error = `\n [${context.hook.type}: ${context.method}]\n   ${context.error.stack || ''}`;
                    header = Chalk.red(`[ERROR] ${header}`);
                }
    
                return `${time} ${header} ${trailer} ${error}`;
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
    
    public get logObject(): ParsedContext {
        return {
            ...this.base,
            statusCode: this.statusCode,
            level: this.level,
            message: this.message,
        }
    }
    
    protected get message() {
        return `${this.base.method.toString().toUpperCase()} ${this.base.route} [${this.base.provider}]`
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

interface ParsedContext {
    message: string;
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