import { HookContext } from '@feathersjs/feathers';
import { get } from 'lodash';
import Chalk from 'chalk';

type ColorName = 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray' | 'redBright'
    | 'greenBright' | 'yellowBright' | 'blueBright' | 'magentaBright' | 'cyanBright' | 'whiteBright';

const colors: ColorName[] = [
    'cyanBright',
    'greenBright',
    'blueBright',
    'magentaBright',
    'green',
    'blue',
    'magenta',
    'cyan',
    'gray',
    'black',
    'yellowBright',
    'redBright',
    'whiteBright',
    'red',
    'yellow',
    'white',
];

/**
 * Pending requests.
 */
let pending = 0;

/**
 * Colours by path.
 */
const pathColours: { [key: string]: ColorName } = {};

/**
 * Build timestamp.
 * @src https://github.com/feathers-plus/feathers-profiler/blob/c7b6be5b52e90ae4a61f4d59672c5b89d9720605/src/index.js
 */
function timestamp () {
    const date = new Date();
    const last2 = (numb: any) => `0${numb}`.slice(-2);
    return `${last2(date.getHours())}:${last2(date.getMinutes())}:${last2(date.getSeconds())}`;
}

/**
 * Fetch unused path colour.
 */
function unusedColour() {
    const available = colors.filter((color) => {
        return Object.values(pathColours).indexOf(color) === -1;
    });

    if (!available.length) {
        return colors[0];
    }


    return available[0];
}

/**
 * Assign colour to the given path.
 */
function assignColor(path: string) {
    let color = pathColours[path];

    if (!color) {
        color = pathColours[path] = unusedColour();
    }

    return Chalk[color](path);
}

export default ({ useInProduction = false } = {}) => {
    return () => {
        if (!useInProduction && process.env.NODE_ENV === 'production') {
            return;
        }

        return require('feathers-profiler').profiler({
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
        });
    }
}