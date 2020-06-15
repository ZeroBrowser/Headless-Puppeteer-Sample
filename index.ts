import { Helper } from "./puppeteerHelper";
import fs = require('fs');
import { PathLike } from 'fs';
import { createWorker } from 'tesseract.js';
import vision = require('@google-cloud/vision');

class Startup {

    urls: Map<String, Array<string>>;

    constructor() {
        this.urls = new Map<String, Array<string>>();

        // this.urls.set("microsoft", new Array<string>("https://www.microsoft.com/en-us", "https://techcommunity.microsoft.com/t5/custom/page/page-id/Blogs"));
        // this.urls.set("ford", new Array<string>("https://www.ford.com", "https://media.ford.com/content/fordmedia/fna/us/en/news.html"));
        // this.urls.set("apple", new Array<string>("https://www.apple.com", "https://www.apple.com/newsroom"));
        // this.urls.set("chevron", new Array<string>("https://www.chevron.com", "https://www.chevron.com/stories"));
        // this.urls.set("amazon", new Array<string>("https://www.amazon.com", "https://aws.amazon.com/blogs"));
        // this.urls.set("google", new Array<string>("https://www.google.com", "https://www.blog.google"));
        //this.urls.set("chase", new Array<string>("https://www.chase.com", "https://www.chase.com/news"));
        this.urls.set("chase", new Array<string>("https://www.chase.com/news"));
        // this.urls.set("walmart", new Array<string>("https://www.walmart.com", "https://corporate.walmart.com/newsroom"));
        // this.urls.set("coca-cola", new Array<string>("https://us.coca-cola.com", "https://www.coca-colacompany.com/news"));
        // this.urls.set("coca-cola", new Array<string>("https://www.tesla.com", "https://www.tesla.com/blog"));
    }

    public async main() {

        let helper = new Helper();
        await helper.init("bdf6f769-e350-45b5-9650-6ea8c9bda5be");


        // Creates a client
        const client = new vision.ImageAnnotatorClient();


        var job = new Promise((resolve, reject) => {
            let current: number = 0;
            let urlsSize = this.urls.size;
            this.urls.forEach((currentUrls: Array<string>, key: String) => {
                var innerJob = new Promise((resolve, reject) => {
                    currentUrls.forEach(async (url, index) => {
                        let imageName = `${key}-${index}.png`;
                        let page = await helper.goto(url);
                        //await helper.elementScreenshot("#content > div.news-stack-row", imageName);                    
                        await page.screenshot({ path: imageName, fullPage: true });
                        await page.close();

                        let text = await this.convertImageToText(imageName);

                        let lowerCaseText = text.toLowerCase();
                        let totalCovidPhrasesFound = this.textSearch(lowerCaseText, new Array<string>("coronavirus", "covid-19", "pandemic"));
                        let totalBLMPhrasesFound = this.textSearch(lowerCaseText, new Array<string>("black", "race", "racial", "justice", "lives matter"));
                        //fs.unlinkSync(imageName);    
                        if (index === currentUrls.length - 1)
                            resolve();
                    });
                });
                innerJob.then(async () => {
                    if (current === urlsSize - 1)
                        resolve();

                    current++;
                });
            });
        });

        job.then(async () => {
            //we are done
            await helper.close();
        });

    }

    async convertImageToText(imageName: string): Promise<string> {
        const worker = createWorker({
            logger: m => console.log(m), // Add logger here
        });

        const rectangle = { left: 0, top: 100, width: 800, height: 600 };

        return new Promise((resolve, reject) => {
            (async () => {
                await worker.load();
                await worker.loadLanguage('eng');
                await worker.initialize('eng');
                const { data: { text, box } } = await worker.recognize(imageName);
                await worker.terminate();
                console.log(imageName + ":" + text);
                resolve(text);
            })();
        });
    }

    textSearch(text: string, phrases: Array<string>): number {
        let total: number = 0;

        phrases.forEach((phrase, index) => {
            let totalFound = text.search(phrase);

            if (totalFound > 0)
                total += totalFound;
        });
        return total;
    }


}

//start the app
new Startup().main();
