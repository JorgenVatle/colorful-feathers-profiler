import { Application, ServiceMethods } from '@feathersjs/feathers';
import Chalk from 'chalk';
import { assignColor } from './Utilities/ColorPicker';
import { getPending, profiler as FeathersProfiler, ProfilerContext, timestamp } from 'feathers-profiler';

export default function ColorfulFeathersProfiler({ enabled = true, logger = console, logStyle = 'string' }: ProfilerOptions) {
    return (App: Application) => {
        if (!enabled) {
            logger.warn('ColorfulFeathersProfiler has been disabled!')
        }
        
        const profiler = FeathersProfiler({
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
    return {
        duration: Math.round(hook._log.elapsed / 1e5) / 10,
        route: hook._log.route,
        provider: hook.params.provider || 'server',
        method: hook.method,
        hook: {
            type: hook.original?.type || hook.type,
        },
        result: {
            status: hook.statusCode,
            error: hook.error,
        }
    }
}

interface ParsedContext {
    duration: number;
    route: string;
    provider: 'server' | 'rest' | 'socketio' | string;
    method: keyof ServiceMethods<any>;
    hook: {
        type: 'before' | 'after' | 'error';
    };
    result: {
        error?: Error;
        status?: number;
    }
}

/**
 * Pending requests.
 */
let pending = 0;

interface ProfilerOptions {
    enabled: boolean;
    logger: CompatibleLogger;
    logStyle?: 'object' | 'string';
}


type CompatibleLogger = Record<'log' | 'warn' | 'error', LogFunction>;
type LogFunction = (message: any) => void;