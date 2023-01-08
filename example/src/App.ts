import Feathers, { Id, Params } from '@feathersjs/feathers';
import ColorfulFeathersProfiler from '../../src';

const App = Feathers();
App.use('test-service', new class {
    async get(id: Id) {
        return `Fetching ${id}`;
    }
    
    async find(params: Params) {
        return `Finding with ${JSON.stringify({ params })}`
    }
});

App.configure(ColorfulFeathersProfiler({
    enabled: true,
    logger: console,
}))