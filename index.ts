import { Helper } from "./puppeteerHelper";
import fs = require('fs');
import { PathLike } from 'fs';
import { createWorker, createScheduler } from 'tesseract.js';
import * as Tesseract from 'tesseract.js';
import vision = require('@google-cloud/vision');

class Startup {

    urls: Array<string>;
    helper: Helper;
    constructor() {
        this.helper = new Helper();

        // this.urls = new Array<any>(
        //     { 'name': "ford-blog", 'url': "https://media.ford.com/content/fordmedia/fna/us/en/news.html" },        
        //     { 'name': "chevron-blog", 'url': "https://www.chevron.com/stories" },            
        //     { 'name': "amazon-blog", 'url': "https://aws.amazon.com/blogs" },            
        //     { 'name': "google-blog", 'url': "https://www.blog.google" },            
        //     { 'name': "chase-blog", 'url': "https://www.chase.com/news" },
        //     { 'name': "coca-cola-blog", 'url': "https://www.coca-colacompany.com/news" },            
        //     { 'name': "tesla-blog", 'url': "https://www.tesla.com/blog" },            
        //     { 'name': "microsoft-blog", 'url': "https://techcommunity.microsoft.com/t5/custom/page/page-id/Blogs" });

        // this.urls = new Array<any>(
        //     { 'name': "ford-blog", 'url': "https://media.ford.com/content/fordmedia/fna/us/en/news.html" }, //W
        //     { 'name': "chevron-blog", 'url': "https://www.chevron.com/stories" },         //W
        //     { 'name': "amazon-blog", 'url': "https://aws.amazon.com/blogs" },             //W
        //     { 'name': "google-blog", 'url': "https://www.blog.google" },                  //W
        //     { 'name': "chase-blog", 'url': "https://www.chase.com/news" },                //W
        //     { 'name': "coca-cola-blog", 'url': "https://www.coca-colacompany.com/news" }, //W
        //     { 'name': "tesla-blog", 'url': "https://www.tesla.com/blog" },                //W
        //     { 'name': "microsoft-blog", 'url': "https://techcommunity.microsoft.com/t5/custom/page/page-id/Blogs" }       //W
        // );

        this.urls = new Array<any>(
            { 'name': "tesla-corp", 'url': "https://www.tesla.com" },
            { 'name': "microsoft-corp", 'url': "https://www.microsoft.com/en-us" },
            //{ 'name': "amazon-corp", 'url': "https://www.amazon.com" },
            { 'name': "chevron-corp", 'url': "https://www.chevron.com" },
            { 'name': "ford-corp", 'url': "https://www.ford.com" }
        );

    }

    public async main() {

        await this.helper.init("bdf6f769-e350-45b5-9650-6ea8c9bda5be");

        // Creates a client
        const client = new vision.ImageAnnotatorClient();

        let results = new Array<any>();

        await this.start(0, this.urls, results);

        this.save(results, "results.json");

        await this.helper.close();

        console.log("Good Bye!");
    }


    async start(index, urls: Array<string>, results: Array<any>) {

        if (index == urls.length)
            return;

        let url = urls[index];

        let title = `${url['name']}`;
        let imageName = `${title}.png`;

        let text = '';

        try {
            console.log(`current website: ${url['url']}`);
            
            let page = await this.helper.goto(url['url']);

            await this.helper.delay(5000);

            await page.screenshot({ path: imageName, fullPage: true });
            await page.close();
            text = await this.convertImageToTextWithGoogleVision(imageName);
            //let text = await this.convertImageToText(imageName); //alternative to Google Vision API. It is much slower currently!

        } catch (error) {            
            console.log(error);
        }

        

        let lowerCaseText = text && text.length > 0 ? text.toLowerCase() : "";
        let totalCovidPhrasesFound = this.textSearch(lowerCaseText, new Array<string>("corona", "coronavirus", "covid-19", "pandemic", "outbreak", "respirators", "masks"));
        let totalBLMPhrasesFound = this.textSearch(lowerCaseText, new Array<string>("BLM", "black", "race", "racial", "justice", "lives matter", "discrimination"));

        results.push({ 'title': title, 'url': url['url'], 'totalCovidPhrasesFound': totalCovidPhrasesFound, 'totalBLMPhrasesFound': totalBLMPhrasesFound });

        await this.start(++index, urls, results);
    }


    async save(results: Array<any>, fileName: PathLike) {
        //lets save it to disk, prettify
        fs.writeFile(fileName, JSON.stringify(results, null, '\t'), function (err) {
            if (err)
                throw err;

            console.log(`${fileName} Saved!`);
        });
    }

    async convertImageToTextWithGoogleVision(imageName: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            let client;

            if (!client) {
                client = new vision.ImageAnnotatorClient();
            }

            // Performs text detection on the local file
            const [result] = await client.textDetection(imageName);
            const detections = result.textAnnotations;
            console.log(`Text for ${imageName}:`);
            let finalText: string;
            detections.forEach(text => {
                console.log(text);
                finalText += text.description;
            });

            resolve(finalText);
        });
    }

    async convertImageToText(imageName: string): Promise<string> {
        const worker1 = createWorker({
            logger: m => console.log(m), // Add logger here
        });
        const worker2 = createWorker({
            logger: m => console.log(m), // Add logger here
        });

        const scheduler = createScheduler();

        const rectangle = { left: 0, top: 100, width: 800, height: 600 };

        return new Promise((resolve, reject) => {
            (async () => {
                await worker1.load();
                await worker1.loadLanguage('eng');
                await worker1.initialize('eng');

                await worker2.load();
                await worker2.loadLanguage('eng');
                await worker2.initialize('eng');

                scheduler.addWorker(worker1);
                scheduler.addWorker(worker2);

                //const { data: { text, box } } = await worker.recognize(imageName);

                const results = await Promise.all(Array(10).fill(0).map(() => (
                    scheduler.addJob('recognize', imageName)
                )));

                //await worker.terminate();
                await scheduler.terminate();
                console.log(imageName + ":" + results);
                resolve("");
            })();
        });
    }

    textSearch(text: string, phrases: Array<string>): number {
        let total: number = 0;

        phrases.forEach((phrase, index) => {
            let totalFound = text.search(phrase);

            if (totalFound > 0)
                total += 1;
        });
        return total;
    }


}

//start the app
new Startup().main();
