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
 * Colours by path.
 */
const pathColours: { [key: string]: ColorName } = {};

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
export function assignColor(path: string) {
    let color = pathColours[path];
    
    if (!color) {
        color = pathColours[path] = unusedColour();
    }
    
    return Chalk[color](path);
}