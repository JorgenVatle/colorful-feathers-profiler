declare module 'feathers-profiler' {
    import { HookContext } from '@feathersjs/feathers';
    
    interface ProfilerOptions {
        logger: null | {
            log: (message: any) => void;
        }
        logMsg(hook: HookContext): any;
        stats: 'none' | 'total' | 'detail' | null,
    }
    
    function profiler(options: ProfilerOptions);
}