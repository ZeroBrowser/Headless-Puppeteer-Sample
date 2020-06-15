"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteerHelper_1 = require("./puppeteerHelper");
var tesseract_js_1 = require("tesseract.js");
var vision = require("@google-cloud/vision");
var Startup = /** @class */ (function () {
    function Startup() {
        this.urls = new Map();
        // this.urls.set("microsoft", new Array<string>("https://www.microsoft.com/en-us", "https://techcommunity.microsoft.com/t5/custom/page/page-id/Blogs"));
        // this.urls.set("ford", new Array<string>("https://www.ford.com", "https://media.ford.com/content/fordmedia/fna/us/en/news.html"));
        // this.urls.set("apple", new Array<string>("https://www.apple.com", "https://www.apple.com/newsroom"));
        // this.urls.set("chevron", new Array<string>("https://www.chevron.com", "https://www.chevron.com/stories"));
        // this.urls.set("amazon", new Array<string>("https://www.amazon.com", "https://aws.amazon.com/blogs"));
        // this.urls.set("google", new Array<string>("https://www.google.com", "https://www.blog.google"));
        //this.urls.set("chase", new Array<string>("https://www.chase.com", "https://www.chase.com/news"));
        this.urls.set("chase", new Array("https://www.chase.com/news"));
        // this.urls.set("walmart", new Array<string>("https://www.walmart.com", "https://corporate.walmart.com/newsroom"));
        // this.urls.set("coca-cola", new Array<string>("https://us.coca-cola.com", "https://www.coca-colacompany.com/news"));
        // this.urls.set("coca-cola", new Array<string>("https://www.tesla.com", "https://www.tesla.com/blog"));
    }
    Startup.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var helper, client, job;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        helper = new puppeteerHelper_1.Helper();
                        return [4 /*yield*/, helper.init("bdf6f769-e350-45b5-9650-6ea8c9bda5be")];
                    case 1:
                        _a.sent();
                        client = new vision.ImageAnnotatorClient();
                        job = new Promise(function (resolve, reject) {
                            var current = 0;
                            var urlsSize = _this.urls.size;
                            _this.urls.forEach(function (currentUrls, key) {
                                var innerJob = new Promise(function (resolve, reject) {
                                    currentUrls.forEach(function (url, index) { return __awaiter(_this, void 0, void 0, function () {
                                        var imageName, page, text, lowerCaseText, totalCovidPhrasesFound, totalBLMPhrasesFound;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    imageName = key + "-" + index + ".png";
                                                    return [4 /*yield*/, helper.goto(url)];
                                                case 1:
                                                    page = _a.sent();
                                                    return [4 /*yield*/, helper.elementScreenshot("#content > div.news-stack-row", imageName)];
                                                case 2:
                                                    _a.sent();
                                                    //await page.screenshot({ path: imageName, fullPage: true });
                                                    return [4 /*yield*/, page.close()];
                                                case 3:
                                                    //await page.screenshot({ path: imageName, fullPage: true });
                                                    _a.sent();
                                                    return [4 /*yield*/, this.convertImageToText(imageName)];
                                                case 4:
                                                    text = _a.sent();
                                                    lowerCaseText = text.toLowerCase();
                                                    totalCovidPhrasesFound = this.textSearch(lowerCaseText, new Array("coronavirus", "covid-19", "pandemic"));
                                                    totalBLMPhrasesFound = this.textSearch(lowerCaseText, new Array("black", "race", "racial", "justice", "lives matter"));
                                                    //fs.unlinkSync(imageName);    
                                                    if (index === currentUrls.length - 1)
                                                        resolve();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                });
                                innerJob.then(function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        if (current === urlsSize - 1)
                                            resolve();
                                        current++;
                                        return [2 /*return*/];
                                    });
                                }); });
                            });
                        });
                        job.then(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: 
                                    //we are done
                                    return [4 /*yield*/, helper.close()];
                                    case 1:
                                        //we are done
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    Startup.prototype.convertImageToText = function (imageName) {
        return __awaiter(this, void 0, void 0, function () {
            var worker, rectangle;
            var _this = this;
            return __generator(this, function (_a) {
                worker = tesseract_js_1.createWorker({
                    logger: function (m) { return console.log(m); },
                });
                rectangle = { left: 0, top: 100, width: 800, height: 600 };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, text, box;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, worker.load()];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, worker.loadLanguage('eng')];
                                    case 2:
                                        _b.sent();
                                        return [4 /*yield*/, worker.initialize('eng')];
                                    case 3:
                                        _b.sent();
                                        return [4 /*yield*/, worker.recognize(imageName)];
                                    case 4:
                                        _a = (_b.sent()).data, text = _a.text, box = _a.box;
                                        return [4 /*yield*/, worker.terminate()];
                                    case 5:
                                        _b.sent();
                                        console.log(imageName + ":" + text);
                                        resolve(text);
                                        return [2 /*return*/];
                                }
                            });
                        }); })();
                    })];
            });
        });
    };
    Startup.prototype.textSearch = function (text, phrases) {
        var total = 0;
        phrases.forEach(function (phrase, index) {
            var totalFound = text.search(phrase);
            if (totalFound > 0)
                total += totalFound;
        });
        return total;
    };
    return Startup;
}());
//start the app
new Startup().main();
//# sourceMappingURL=index.js.map