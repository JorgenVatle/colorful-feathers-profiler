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


App.configure(ColorfulFeathersProfiler({
    enabled: true,
    logger: console,
}))