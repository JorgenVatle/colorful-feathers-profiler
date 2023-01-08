import { Application } from '@feathersjs/feathers';
import { profiler as FeathersProfiler } from 'feathers-profiler';
import { Parser } from './Utilities/ContextParser';
import { ObjectLogFormatter } from './Utilities/Formats/ObjectLogFormatter';
import { StringLogFormatter } from './Utilities/Formats/StringLogFormatter';

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

interface ProfilerOptions {
    enabled?: boolean;
    logger?: CompatibleLogger;
    logStyle?: 'object' | 'string';
}


type CompatibleLogger = Record<'log' | 'warn' | 'error', LogFunction>;
type LogFunction = (message: any) => void;