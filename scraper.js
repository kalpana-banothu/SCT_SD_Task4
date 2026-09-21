const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const products = [];

async function scrape() {
    for (let page = 1; page <= 5; page++) {

        const url = `http://books.toscrape.com/catalogue/page-${page}.html`;

        try {
            const response = await axios.get(url);

            const $ = cheerio.load(response.data);

            $('article.product_pod').each((index, element) => {

                const name = $(element)
                    .find('h3 a')
                    .attr('title');

                const price = $(element)
                    .find('p.price_color')
                    .text()
                    .trim();

                const ratingClass = $(element)
                    .find('p.star-rating')
                    .attr('class');

                const ratingWord = ratingClass.split(' ')[1];

                const ratingMap = {
                    One: 1,
                    Two: 2,
                    Three: 3,
                    Four: 4,
                    Five: 5
                };

                const rating = ratingMap[ratingWord];

                const productLink = $(element)
                    .find('h3 a')
                    .attr('href');

                const productUrl = new URL(productLink, url).href;

                products.push({
                    name,
                    price,
                    rating,
                    productUrl
                });
            });

            console.log(
                `Page ${page}: ${$('article.product_pod').length} products scraped`
            );

        } catch (error) {
            console.log(`Error scraping page ${page}:`, error.message);
        }
    }

    // Create CSV content
    const header = 'Product Name,Price,Rating,Product URL\n';

    const rows = products.map(product => {
        const escapeCSV = value =>
            `"${String(value).replace(/"/g, '""')}"`;

        return [
            escapeCSV(product.name),
            escapeCSV(product.price),
            escapeCSV(product.rating),
            escapeCSV(product.productUrl)
        ].join(',');
    }).join('\n');

    // Save CSV file
    fs.writeFileSync(
        'products.csv',
        header + rows,
        'utf8'
    );

    console.log(`\nSuccessfully saved ${products.length} products to products.csv`);
}

scrape();