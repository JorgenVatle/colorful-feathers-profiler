import Feathers, { Id, Params } from '@feathersjs/feathers';
import ColorfulFeathersProfiler from '../../src';

const services = {
    'test-service': new class {
        async get(id: Id) {
            return `Fetching ${id}`;
        }
    
        async find(params: Params) {
            return `Finding with ${JSON.stringify({ params })}`
        }
    }
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
    const service = App.service('test-service');
    await service.find({ query: { foo: 'bar' } });
    await service.get('some-id');
}, 50)