# 0Browser-Black-Life-Matters

Using 0Browser/Headless Browser + Puppeteer to analyse Corporate websites.

Find the full story [here](https://www.0browser.com/blogs/.html)

## Prerequisites
Get a free API Token from [0Borwser here](https://www.0browser.com/docs/get-token.html) 

## ⛏ Build

First, update browserWSEndpoint in puppeteerHelper.ts with your [0Browser](https://www.0browser.com) api token.

Then, open the terminal and run the following command to restore npm packages:

```
npm install
```

Build the Typescript application using this command:

```
npm run tsc
```

Then, you can run the application using 

```
node .\out\index
```

Run it twice, once before change and once after change!

Enjoy! :wink:
