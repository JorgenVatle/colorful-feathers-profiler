import { Application, HookContext } from '@feathersjs/feathers';
import Chalk from 'chalk';
import { get } from 'lodash';
import { assignColor } from './Utilities/ColorPicker';
import { profiler as FeathersProfiler, timestamp } from 'feathers-profiler';

export default function ColorfulFeathersProfiler({ enabled = true, logger = console }: ProfilerOptions) {
    return (App: Application) => {
        if (!enabled) {
            logger.warn('ColorfulFeathersProfiler has been disabled!')
        }
        
        const profiler = FeathersProfiler({
            logMsg(hook) {
                const elapsed = Math.round(hook._log.elapsed / 1e5) / 10;
                const route = hook.params.provider ? assignColor(hook._log.route) : hook._log.route;
                const provider = Chalk.yellowBright(get(hook.params, 'provider', Chalk.grey('server')));
                
                const header = `${timestamp()} ${route}::${hook.method}`;
                const trailer = `(${provider}) ${elapsed} ms - ${pending} pending`;
                
                let logMessage = `${header} ${trailer}`;
        
                if (hook.error) {
                    logMessage += ` - ${Chalk.red('FAILED')} ${hook.original?.type} ${hook.error.message || ''}`;
                }
        
                return logMessage;
            },
        })
        
        return App.configure(profiler);
    }
}

/**
 * Pending requests.
 */
let pending = 0;

interface ProfilerOptions {
    enabled: boolean;
    logger: CompatibleLogger;
}


type CompatibleLogger = Record<'log' | 'warn' | 'error', LogFunction>;
type LogFunction = (message: any) => void;