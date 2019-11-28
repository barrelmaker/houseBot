const cron = require('node-cron');
const dotenv = require('dotenv');
dotenv.config();

// Sets increment counter
let counter = 0;

cron.schedule('* * * * *', () => {

    const {Builder, By, Key, until} = require('selenium-webdriver');
    const accountSid = process.env.ACCOUNT_SID; 
    const authToken = process.env.AUTH_TOKEN;   
    const twilio = require('twilio');

    // Checks how many times it has ran successfully, if greater tthan 10 then stop sending texts
    if (counter > 10) {
        process.exit(22)
    }

    // Twilio client
    const client = new twilio(accountSid, authToken);

    (async function example() {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            // Navigate to Url
            await driver.get('https://listingservice.housing.queensu.ca/index.php/rental/rentalsearch/action/results_list/');

            // Enter credentials to the proper fields
            //await driver.findElement(By.name('rentalsearch[property_types][4]')).click();
            //await driver.findElement(By.name('rentalsearch[lease_types][2]')).click();
            //await driver.findElement(By.name('rentalsearch[lease_types][1]')).click();
            await driver.findElement(By.name('rentalsearch[bedrooms]')).sendKeys('5', Key.ENTER);
            await driver.findElement(By.name('rentalsearch[perpage]')).sendKeys('5', Key.ENTER);
            await driver.findElement(By.xpath("/html/body/div[5]/div/div/form[1]/div/input")).click();

            // Gets the page source
            let text = await driver.getPageSource();

            // If the desired house is listed
            if (text.includes(process.env.HOUSE)) {
                
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

                // Send only a number of times
                counter++
                console.log(counter);
            }
        }

        finally{
            driver.quit();
        }
    })();
})