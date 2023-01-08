import Feathers from '@feathersjs/feathers';
import { getProfile } from 'feathers-profiler';
import * as Util from 'util';
import ColorfulFeathersProfiler from '../../src';
import LoggerService from './Services/LoggerService';


const services = {
    'test-service-1': new LoggerService(),
    'test-service-2': new LoggerService(),
    'keepalive': new LoggerService(),
} as const;

const App = Feathers<typeof services>();

for (const [path, service] of Object.entries(services)) {
    App.use(path, service);
}


App.configure(ColorfulFeathersProfiler({
    enabled: true,
    logger: console,
}));

setTimeout(async () => {
    for (const [path, service] of Object.entries(App.services)) {
        await service.find({ query: { foo: 'bar' } });
        await service.get('some-id');
    }
    
    await App.service('test-service-1').find({ query: { throw: new Error('Testing error handling') } }).catch(() => {})
    
    console.log(Util.inspect(getProfile(), { colors: true, depth: null }))
}, 50);

let keepAliveCount = 0;

/**
 * Keep the app running until explicitly exited by the user.
 */
setInterval(async () => {
    await App.services.keepalive.get(keepAliveCount += 1);
}, 60_000)