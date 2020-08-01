# Colorful Feathers Profiler
> A wrapper around [`feathers-profiler`](https://github.com/feathers-plus/feathers-profiler) making profiling logs
> slightly more human readable.


## Installation
```bash
npm install colorful-feathers-profiler
```

Add the profiler to your Feathers app:
```typescript
import Feathers from '@feathersjs/feathers';
import FeathersProfiler from 'colorful-feathers-profiler';

const App = Feathers();

App.configure(FeathersProfiler({
    useInProduction: true, // Default: false
}))
```

## License
This repository is licensed under the ISC license.

Copyright (c) 2020, Jørgen Vatle.