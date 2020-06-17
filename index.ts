import { Helper } from "./puppeteerHelper";
import fs = require('fs');
import { PathLike } from 'fs';
import { createWorker, createScheduler } from 'tesseract.js';
import * as Tesseract from 'tesseract.js';
import vision = require('@google-cloud/vision');

class Startup {

    blogUrls: Array<string>;
    corporateUrls: Array<string>;
    helper: Helper;

    constructor() {
        this.helper = new Helper();

        this.blogUrls = new Array<any>(
            { 'name': "ford-blog", 'url': "https://media.ford.com/content/fordmedia/fna/us/en/news.html" },
            { 'name': "chevron-blog", 'url': "https://www.chevron.com/stories" },
            { 'name': "amazon-blog", 'url': "https://aws.amazon.com/blogs" },
            { 'name': "tesla-blog", 'url': "https://www.tesla.com/blog" },
            { 'name': "microsoft-blog", 'url': "https://techcommunity.microsoft.com/t5/custom/page/page-id/Blogs" }
        );

        this.corporateUrls = new Array<any>(
            { 'name': "tesla-corp", 'url': "https://www.tesla.com" },
            { 'name': "microsoft-corp", 'url': "https://www.microsoft.com/en-us" },
            //{ 'name': "amazon-corp", 'url': "https://www.amazon.com" },               //some issues with amazon
            { 'name': "chevron-corp", 'url': "https://www.chevron.com" },
            { 'name': "ford-corp", 'url': "https://www.ford.com" }
        );

    }

    public async main() {

        await this.helper.init("bdf6f769-e350-45b5-9650-6ea8c9bda5be");

        // Creates a client
        const client = new vision.ImageAnnotatorClient();

        let results = new Array<any>();

        await this.start(0, this.corporateUrls, results);

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
