import Feathers from '@feathersjs/feathers';
import ColorfulFeathersProfiler from '../../src';
import LoggerService from './Services/LoggerService';


const services = {
    'test-service-1': new LoggerService(),
    'test-service-2': new LoggerService(),
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
}, 50)