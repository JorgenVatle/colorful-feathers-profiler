import { Application, HookContext } from '@feathersjs/feathers';
import Chalk from 'chalk';
import { get } from 'lodash';
import { assignColor } from './Utilities/ColorPicker';

export default ({ useInProduction = false, useInTests = false } = {}) => {
    return (App: Application) => {
        if (!useInProduction && process.env.NODE_ENV === 'production') {
            return;
        }
        
        if (!useInTests && process.env.NODE_ENV === 'test') {
            return;
        }
        
        return App.configure(require('feathers-profiler').profiler({
            logMsg(hook: HookContext & { _log: any, original: any }) {
                hook._log = hook._log || {};
                const elapsed = Math.round(hook._log.elapsed / 1e5) / 10;
                const header = `${timestamp()} ${hook.params.provider ? assignColor(hook._log.route) : hook._log.route}::${hook.method}`;
                const provider = Chalk.yellowBright(get(hook.params, 'provider', Chalk.grey('server')));
                const trailer = `(${provider}) ${elapsed} ms - ${pending} pending`;
                let logMessage = `${header} ${trailer}`;
                
                if (hook.error) {
                    logMessage += ` - ${Chalk.red('FAILED')} ${(hook.original || {}).type} ${hook.error.message || ''}`;
                }
                
                return logMessage;
            },
        }));
    }
}

/**
 * Pending requests.
 */
let pending = 0;

/**
 * Build timestamp.
 * @src https://github.com/feathers-plus/feathers-profiler/blob/c7b6be5b52e90ae4a61f4d59672c5b89d9720605/src/index.js
 */
function timestamp () {
    const date = new Date();
    const last2 = (numb: any) => `0${numb}`.slice(-2);
    return `${last2(date.getHours())}:${last2(date.getMinutes())}:${last2(date.getSeconds())}`;
}
