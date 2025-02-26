// React Testing Library functions
require('@testing-library/jest-dom');

// Since Jest does not include TextEncoder by default, it must be added here
if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = require('util').TextEncoder;
    global.TextDecoder = require('util').TextDecoder;
}