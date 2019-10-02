/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

throw new Error("Module build failed: ModuleBuildError: Module build failed: BrowserslistError: `browserlist` key instead of `browserslist` in /Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/package.json\n    at parsePackage (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/browserslist/node.js:85:11)\n    at /Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/browserslist/node.js:254:29\n    at eachParent (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/browserslist/node.js:47:18)\n    at Object.findConfig (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/browserslist/node.js:246:20)\n    at Function.loadConfig (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/browserslist/node.js:177:37)\n    at browserslist (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/browserslist/index.js:325:31)\n    at Browsers.parse (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/autoprefixer/lib/browsers.js:66:12)\n    at new Browsers (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/autoprefixer/lib/browsers.js:48:26)\n    at loadPrefixes (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/autoprefixer/lib/autoprefixer.js:101:20)\n    at plugin (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/autoprefixer/lib/autoprefixer.js:112:20)\n    at LazyResult.run (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/postcss/lib/lazy-result.js:295:14)\n    at LazyResult.asyncTick (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/postcss/lib/lazy-result.js:208:26)\n    at /Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/postcss/lib/lazy-result.js:250:14\n    at new Promise (<anonymous>)\n    at LazyResult.async (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/postcss/lib/lazy-result.js:246:23)\n    at LazyResult.then (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/postcss/lib/lazy-result.js:127:17)\n    at Promise.resolve.then.then (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/postcss-loader/src/index.js:142:8)\n    at runLoaders (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/webpack/lib/NormalModule.js:195:19)\n    at /Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/loader-runner/lib/LoaderRunner.js:367:11\n    at /Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/loader-runner/lib/LoaderRunner.js:233:18\n    at context.callback (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/loader-runner/lib/LoaderRunner.js:111:13)\n    at Promise.resolve.then.then.catch (/Users/quanlincong/openSource/blog-github/webpack/how-to-use-postcss-loader/node_modules/postcss-loader/src/index.js:208:9)");

/***/ })
/******/ ]);