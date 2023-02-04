import { FeathersError } from '@feathersjs/errors';
import { HookContext, Params, ServiceMethods } from '@feathersjs/feathers';
import { ProfilerContext } from 'feathers-profiler';

export class Parser {
    protected base: BaseContext;
    
    constructor(protected readonly hook: ProfilerContext) {
        this.base = {
            provider: hook.params.provider || 'server',
            error: hook.error,
            method: hook.method,
            route: hook._log.route.replace(/^\/*/, '/'),
            duration: hook._log.elapsed,
            hook: {
                type: hook.original?.type || hook.type,
            },
            id: hook.id,
            headers: hook.params.headers,
            query: hook.params.query,
        };
    };
    
    public get data(): ParsedContext {
        return {
            ...this.base,
            statusCode: this.statusCode,
            level: this.level,
            durationMs: this.durationMs,
        };
    }
    
    protected get level(): ParsedContext['level'] {
        return this.base.error ? 'error' : 'info';
    }
    
    protected get durationMs() {
        return Math.round(this.base.duration / 1e5) / 10
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

type BaseContext = Pick<ParsedContext, 'provider' | 'error' | 'method' | 'route' | 'hook' | 'duration' | 'headers' | 'id' | 'query'>;

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
    durationMs: number;
    headers?: Params['headers'],
    query?: Params['query'],
    id?: HookContext['id'],
}