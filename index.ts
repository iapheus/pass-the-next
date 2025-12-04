// Middleware
export { accessControl } from './middleware/accessControl';

import fixedRateLimiter from './middleware/fixedRateLimiter';
export { fixedRateLimiter };

import slidingRateLimiter from './middleware/slidingRateLimiter';
export { slidingRateLimiter };

import sqliDetector from './middleware/sqliDetector';
export { sqliDetector };

import xssDetector from './middleware/xssDetector';
export { xssDetector };

import pathTraversalDetector from './middleware/pathTraversalDetector';
export { pathTraversalDetector };

import fuzzerDetector from './middleware/fuzzerDetector';
export { fuzzerDetector };

// Options
import { setXssDetectorOptions } from './core/xss-detector/XssDetectorOptions';
export { setXssDetectorOptions };

import { setSqliDetectorOptions } from './core/sqli-detector/SqliDetectorOptions';
export { setSqliDetectorOptions };

import { setFuzzerDetectorOptions } from './core/fuzzer-detection/FuzzerDetectorOptions';
export { setFuzzerDetectorOptions };

import { setPathTraversalDetectorOptions } from './core/path-traversal-detector/PathTraversalDetectorOptions';
export { setPathTraversalDetectorOptions };

import { setLoggerOptions } from './core/access-control/Logger/LoggerOptions';
export { setLoggerOptions };

import { setBlockerOptions } from './core/access-control/Blocker/BlockerOptions';
export { setBlockerOptions };

import { setFixedRateLimiterOptions } from './core/rate-limiter/fixed/FixedRateLimiterOptions';
export { setFixedRateLimiterOptions };

import { setSlidingRateLimiterOptions } from './core/rate-limiter/sliding/SlidingRateLimiterOptions';
export { setSlidingRateLimiterOptions };
