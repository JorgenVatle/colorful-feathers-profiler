import Feathers, { Id, Params } from '@feathersjs/feathers';

const App = Feathers();
App.use('test-service', new class {
    async get(id: Id) {
        return `Fetching ${id}`;
    }
    
    async find(params: Params) {
        return `Finding with ${JSON.stringify({ params })}`
    }
})