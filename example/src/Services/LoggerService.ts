import { Id, Params } from '@feathersjs/feathers';

export default class LoggerService {
    protected serialize(content: any) {
        return JSON.stringify(content);
    }
    
    async get(id: Id, params?: Params) {
        return `Fetching ${id} with ${this.serialize({ params })}`;
    }
    
    async find(params?: Params) {
        return `Finding with ${JSON.stringify({ params })}`
    }
    
}