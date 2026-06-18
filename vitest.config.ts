import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: false
      }
    },
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1
  }
})
