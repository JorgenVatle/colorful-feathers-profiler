declare module 'feathers-profiler' {
    import { HookContext } from '@feathersjs/feathers';
    
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
    
    function clearProfile(): void;
    function getProfile(): unknown;
    function timestamp(): string;
    function getPending(): number;
    
    function profiler(options: ProfilerOptions);
}