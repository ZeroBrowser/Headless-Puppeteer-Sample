import { Helper } from "./puppeteerHelper";
import fs = require('fs');
import { PathLike } from 'fs';
import vision = require('@google-cloud/vision');

class Startup {

    blogUrls: Array<string>;
    corporateUrls: Array<string>;
    helper: Helper;
    client: vision.v1.ImageAnnotatorClient;
    readonly COVID_KEYWORDS: Array<string> = new Array<string>("corona", "coronavirus", "covid-19", "pandemic", "outbreak", "respirators", "masks");
    readonly BLM_KEYWORDS: Array<string> = new Array<string>("BLM", "black", "race", "racial", "justice", "lives matter", "discrimination");

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
            { 'name': "amazon-corp", 'url': "https://www.amazon.com" }
            { 'name': "chevron-corp", 'url': "https://www.chevron.com" },
            { 'name': "ford-corp", 'url': "https://www.ford.com" }
        );

        //create a Google Vision Client
        this.client = new vision.ImageAnnotatorClient();
    }

    public async main() {

        //helper is useful for repeating common tasks
        await this.helper.init("Your 0Browser Token Here");

        //lets start the main process
        let results = await this.start(this.blogUrls);

        //save results in json file
        this.save(results, "results.json");

        //close browser with Puppeteer
        this.helper.closeBrowser();

        console.log("Good Bye!");
    }


    async start(urls: Array<string>): Promise<Array<any>> {

        //create empty list. It will be populated with information we need
        let results = new Array<any>();

        //start creating 
        await this.analyseSites(0, this.corporateUrls, results);

        return results;
    };


    /**
     * Recursive method. lets go through all urls, take a screenshot and use OCR to get its text.
     * Then count related keywords for BLM and COVID-19
     * @param fileName
     * @returns script version
     */
    async analyseSites(index, urls: Array<string>, results: Array<any>) {

        //we have scanned all urls
        if (index >= urls.length)
            return;

        let currentItem = urls[index];
        let title = `${currentItem['name']}`;
        let url = currentItem['url'];
        let imageName = `${title}.png`;
        let text = '';

        try {
            //take screenshot
            await this.takeScreenshot(url, imageName);

            //use Google Vision ML to process screenshots
            text = await this.convertImageToTextWithGoogleVision(imageName);
        } catch (error) {
            console.log(error);
            //lets skip and go to the next item
            await this.analyseSites(++index, urls, results);
        }

        const result = this.keywordCount(text, title, url);
        results.push(result);

        //recursive call
        await this.analyseSites(++index, urls, results);
    }

    keywordCount(text: string, title: string, url: string): any {
        let lowerCaseText = text && text.length > 0 ? text.toLowerCase() : "";
        let totalCovidPhrasesFound = this.textSearch(lowerCaseText, this.COVID_KEYWORDS);
        let totalBLMPhrasesFound = this.textSearch(lowerCaseText, this.BLM_KEYWORDS);

        return { 'title': title, 'url': url, 'totalCovidPhrasesFound': totalCovidPhrasesFound, 'totalBLMPhrasesFound': totalBLMPhrasesFound };
    }

    async takeScreenshot(url: string, imageName: string) {
        console.log(`current website: ${url}`);

        let page = await this.helper.goto(url);

        //a little delay for heavy websites like Tesla!
        await this.helper.delay(5000);

        //take full page so we can see everything
        await page.screenshot({ path: imageName, fullPage: true });

        //clean up and close page
        await page.close();
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
