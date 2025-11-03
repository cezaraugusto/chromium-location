#!/usr/bin/env node

const chromiumLocation = require('./module')

const argv = process.argv.slice(2)
const allowFallback = argv.includes('--fallback') || argv.includes('-f')

console.log(chromiumLocation(allowFallback))
