const request = require("request-promise");
const cheerio = require("cheerio");
const { initializeApp, cert } = require ('firebase-admin/app');
const { getFirestore } =  require('firebase-admin/firestore');
const serviceAccount  = require ("./serviceAccountKey.js")
const cron = require ( 'node-cron')





const express = require('express')
const app = express()
const port = 3000
app.get(`/`, (request, response) => {
    response.send('Hello from Express!')
})










initializeApp({
    credential: cert(serviceAccount)
  });

  const db = getFirestore();



const r1 = request("https://minfin.com.ua/company/alfa-bank/currency/")
  .then(function (bodyR) {
    const $ = cheerio.load(bodyR);
    let target = [5, 6, 9, 10, 21, 22, 25, 26]; //5 6 usd  // 9 10  eur // usd karta 21 22// eur karta 25 26
    let arrays = [];
    target.map((e) => {
      let zzz = cheerio.text($("td").eq(e));
      arrays.push(zzz.trim().slice(0, 5));
    });
    return { currency: arrays };
  })
  .catch(function (err) {
    return {
      currency: [
        "00.00",
        "00.00",
        "00.00",
        "00.00",
        "00.00",
        "00.00",
        "00.00",
        "00.00",
      ],
    };
  });
  

const r2 = request("https://index.minfin.com.ua/banks/nbu/intervention/")
  .then(function (bodyR) {
    const $ = cheerio.load(bodyR);
    return { intervention: cheerio.text($(`span`).eq(19)) };
  })
  .catch(function (err) {
    return { intervention: '00.00' };
  });
 



const r3 = request("https://index.minfin.com.ua/finance/assets/")
  .then(function (bodyR) {
    const $ = cheerio.load(bodyR);
    let zzz = cheerio.text($(`tr`).eq(12));
    return { assets: parseInt(zzz.trim().slice(24, 27)) / 10 };
  })
  .catch(function (err) {
    return { assets: 0.0 };
  });

  cron.schedule('0 */2 * * * *', () => {

Promise.all([r1, r2, r3]).then((val) => {
  console.log(val);
  
  let date = new Date();

  const minuttes = (date.getMinutes()<10?'0':'') + date.getMinutes()
  const timenaw= `${date.getHours()+':'+minuttes}`


  var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
  var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
  let todayLocal = localISOTime.split('T')[0]


console.log(todayLocal, "todayLocal")

const asdf= async r=>{
    try {  await db.collection(`currency`).doc(`today`).update({val,time:`${todayLocal}`+`${timenaw}` }) }catch(err){console.log(err); return}
  console.log("Data was sended") }
  asdf()
});

  })




//       try {  await db.collection(`${todayLocal}`).doc(`${timenaw}`).set({val}) }catch(err){console.log(err); return}

app.listen(port, (err) => {
  if (err) {
      return console.log('something bad happened', err)
  }
  console.log(`server is listening on ${port}`)
})