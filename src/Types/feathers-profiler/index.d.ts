declare module 'feathers-profiler' {
    import Feathers, { Application, HookContext, ServiceMethods } from '@feathersjs/feathers';
    
    interface ProfilerContext extends HookContext {
        _log: {
            route: string;
            key: '_total';
            hrtime: [number, number];
            elapsed: number;
        };
        original?: unknown;
    }
    
    interface ProfilerOptions {
        logger?: null | {
            log: (message: any) => void;
        }
        logMsg?: (hook: ProfilerContext) => any;
        stats?: 'none' | 'total' | 'detail' | null,
    }
    
    type Profile<App> = App extends Application<infer Services> ? ProfileMap<Services> : never;
    type ProfileMap<Services extends { [key: string]: any }> = {
        [key in keyof Services as key & string]: {
            [key in keyof ServiceMethods<any>]: {
                _total: {
                    calledCount: number;
                    pendingTotal: number;
                    pendingAvg: number;
                    resolvedCount: number;
                    avgMs: number;
                    nanoMin: number;
                    nanoMax: number;
                    resultItemsCount: number;
                }
            }
        }
    }
    
    function clearProfile(): void;
    function getProfile<App extends Application>(): Profile<App>;
    function timestamp(): string;
    function getPending(): number;
    
    function profiler(options: ProfilerOptions);
}