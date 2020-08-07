# Colorful Feathers Profiler
> A wrapper around [`feathers-profiler`](https://github.com/feathers-plus/feathers-profiler) making profiling logs
> slightly more human readable.


## Installation
1. Install
```bash
npm install colorful-feathers-profiler
```

2. Add the profiler to your Feathers app:
```typescript
import Feathers from '@feathersjs/feathers';
import FeathersProfiler from 'colorful-feathers-profiler';

const App = Feathers();

App.configure(FeathersProfiler({
    useInProduction: true, // Default: false
}))
```

3. Enjoy!

![Console Preview](https://i.gyazo.com/1fb66e2e4529f712c88a075c7be39e87.png)

## License
This repository is licensed under the ISC license.

Copyright (c) 2020, Jørgen Vatle.
