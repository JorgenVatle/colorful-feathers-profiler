import { FeathersError } from '@feathersjs/errors';
import { Application, ServiceMethods } from '@feathersjs/feathers';
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
                const context = parseContext(hook);
    
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

function parseContext(hook: ProfilerContext): ParsedContext {
    const base: Pick<ParsedContext, 'provider' | 'error' | 'method' | 'route' | 'hook' | 'duration' | 'statusCode'> = {
        provider: hook.params.provider || 'server',
        error: hook.error,
        method: hook.method,
        route: hook._log.route.replace(/^\/*/, '/'),
        duration: Math.round(hook._log.elapsed / 1e5) / 10,
        hook: {
            type: hook.original?.type || hook.type
        },
        statusCode: inferStatusCode(hook),
    }
    
    const computed: Omit<ParsedContext, keyof typeof base> = {
        message: `${base.method.toString().toUpperCase()} ${base.route} [${base.provider}]`,
        level: base.error ? 'error' : 'info',
    }
    
    return {
        ...base,
        ...computed,
    }
}

function inferStatusCode(hook: ProfilerContext) {
    if (hook.statusCode) {
        return hook.statusCode;
    }
    
    if (!hook.error) {
        return 200;
    }
    
    if (!hook.error.statusCode) {
        return 500;
    }
    
    return hook.error.statusCode;
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