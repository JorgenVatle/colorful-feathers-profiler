import { FeathersError } from '@feathersjs/errors';
import { ServiceMethods } from '@feathersjs/feathers';
import { ProfilerContext } from 'feathers-profiler';

export class Parser {
    protected base: Pick<ParsedContext, 'provider' | 'error' | 'method' | 'route' | 'hook' | 'duration'>;
    
    constructor(protected readonly hook: ProfilerContext) {
        this.base = {
            provider: hook.params.provider || 'server',
            error: hook.error,
            method: hook.method,
            route: hook._log.route.replace(/^\/*/, '/'),
            duration: Math.round(hook._log.elapsed / 1e5) / 10,
            hook: {
                type: hook.original?.type || hook.type,
            },
        };
    };
    
    public get data(): ParsedContext {
        return {
            ...this.base,
            statusCode: this.statusCode,
            level: this.level,
        };
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

export interface ParsedContext {
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