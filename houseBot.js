const cron = require('node-cron');
const dotenv = require('dotenv');
dotenv.config();

cron.schedule('0,33 * * * *', () => {
    const {Builder, By, Key, until} = require('selenium-webdriver');
    const accountSid = process.env.ACCOUNT_SID; 
    const authToken = process.env.AUTH_TOKEN;   
    const twilio = require('twilio');

    // Twilio client
    const client = new twilio(accountSid, authToken);

    (async function example() {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            // Navigate to Url
            await driver.get('https://listingservice.housing.queensu.ca/index.php/rental/rentalsearch/action/results_list/');

            // Enter credentials to the proper fields
            await driver.findElement(By.name('rentalsearch[property_types][4]')).click();
            await driver.findElement(By.name('rentalsearch[lease_types][1]')).click();
            await driver.findElement(By.name('rentalsearch[bedrooms]')).sendKeys('5', Key.ENTER);
            await driver.findElement(By.name('rentalsearch[perpage]')).sendKeys('5', Key.ENTER);

            // Gets the page source
            let text = await driver.getPageSource();
            
            // If the desired house is listed
            if (text.includes('187 University')) {
                
                client.messages.create({
                    body: 'The house is on the market!',
                    to: process.env.JOSH_NUMBER,  
                    from: process.env.TWILIO_NUMBER
                }).then(message => console.log(message.sid));
                
                client.messages.create({
                    body: 'The house is on the market!',
                    to: process.env.COOP_NUMBER,  
                    from: process.env.TWILIO_NUMBER
                }).then(message => console.log(message.sid));
            }
        }

        finally{
            driver.quit();
        }
    })();
})
