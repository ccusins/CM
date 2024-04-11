const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
require("dotenv").config();
const {KindeClient, GrantType} = require("@kinde-oss/kinde-nodejs-sdk");
const e = require('express');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);

const token = process.env.SUPPORT_TOKEN;

const options = {
domain: process.env.KINDE_DOMAIN,
clientId: process.env.KINDE_CLIENT_ID,
clientSecret: process.env.KINDE_CLIENT_SECRET,
redirectUri: process.env.KINDE_REDIRECT_URI,
logoutRedirectUri: process.env.KINDE_LOGOUT_REDIRECT_URI,
grantType: GrantType.PKCE
};

const kindeClient = new KindeClient(options);
const app = express();

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

const adminNumbers = process.env.ADMIN_NUMBERS.split(',');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

async function clientWelcome(phone) {

  body = 'Welcome to CMBetting! \n\nYou will be sent a contract soon which covers our service. \n\nYou will also be contacted shortly for your bank details, needed for us to provide you with the money for deposits.'

  twilioClient.messages
  .create({
    body: body,
    from: process.env.TWILIO_NUMBER,
    to: phone,
  });

}

async function clientMovedStage(userid) {

  body = 'You have been moved to the next stage! \n\nPlease head over to your accounts page and request funds if needed for the next batch of accounts.'

  const userRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getuserphone/${token}/${userid}`)
  const data = userRes.data;

  const phone = data.phone;

  twilioClient.messages
  .create({
    body: body,
    from: process.env.TWILIO_NUMBER,
    to: phone,
  });

}

async function clientFundRequest(userid, amount) {

  body = `£${amount} has been credited to your bank account. \n\nPlease head over to your accounts page and make the next batch of accounts.`

  const userRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getuserphone/${token}/${userid}`)
  const data = userRes.data;

  const phone = data.phone;

  twilioClient.messages
  .create({
    body: body,
    from: process.env.TWILIO_NUMBER,
    to: phone,
  });
  
}


async function adminWelcome(req) {

  const userRes = await kindeClient.getUserDetails(req); 

  const firstName = userRes.given_name;
  const lastName = userRes.family_name;

  const fullName = `${lastName}, ${firstName}`;

  adminNumbers.forEach(adminNumber => {
    twilioClient.messages
    .create({
      body: `NEW USER \n Name: ${fullName}`,
      from: process.env.TWILIO_NUMBER,
      to: adminNumber
    });
  });  

}

async function adminFundsRequested(req, res) {

  const userRes = await kindeClient.getUserDetails(req); 

  const userid = userRes.id;
  const firstName = userRes.given_name;
  const lastName = userRes.family_name;

  const fullName = `${lastName}, ${firstName}`;

  const getAdminNumbersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getadminnumbers/${userid}`)
  const adminNumbers = await getAdminNumbersRes.data.numbers;

  adminNumbers.forEach(adminNumber => {
    twilioClient.messages
    .create({
      body: `NEW FUND REQUEST \n Name: ${fullName} \n UserID: ${userid}`,
      from: process.env.TWILIO_NUMBER,
      to: adminNumber
    });
  });  

}

async function adminNewAccountMade(req, res) {

  const userRes = await kindeClient.getUserDetails(req); 

  const userid = userRes.id;
  const firstName = userRes.given_name;
  const lastName = userRes.family_name;

  const fullName = `${lastName}, ${firstName}`;

  const getAdminNumbersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getadminnumbers/${userid}`)
  const adminNumbers = await getAdminNumbersRes.data.numbers;

  adminNumbers.forEach(adminNumber => {
    twilioClient.messages
    .create({
      body: `NEW ACCOUNT MADE \n Name: ${fullName} \n UserID: ${userid}`,
      from: process.env.TWILIO_NUMBER,
      to: adminNumber
    });
  });  

}

function authenticateWelcome(req, res, next) {

  if (req.session.authenticated) {
      next();
  } else {
      res.redirect('/')
  }
}

function supportAuthentication(req, res, next) {

  if (req.session.authenticated) {
      next();
  } else {
      res.redirect('/support')
  }
}



app.get('/cmbettingapi/pagelogin/:attempt', (req, res) => {
  const password = req.params.attempt;
  const correctPassword = process.env.PAGE_PASSWORD;

  if (password === correctPassword) {
    req.session.authenticated = true;
    res.redirect('/welcome')
  } else {
    res.send('Incorrect');
  }
});

app.get('/cmbettingapi/supportpagelogin/:attempt', (req, res) => {
  const password = req.params.attempt;
  const correctPassword = process.env.SUPPORT_PAGE_PASSWORD;

  if (password === correctPassword) {
    req.session.authenticated = true;
    res.redirect('/supportpage')
  } else {
    res.send('Incorrect');
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/welcome', authenticateWelcome, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'welcome.html'));
});


app.get('/checklogin', async (req, res) => {
  let isAuthenticated = kindeClient.isAuthenticated(req);
  if (!isAuthenticated) {
    return res.redirect('/login')
  } else {
    return res.redirect('/users')
  }
});

app.get('/checkregister', async (req, res) => {
  let isAuthenticated = kindeClient.isAuthenticated(req);
  if (!isAuthenticated) {
    return res.redirect('/register')
  } else {
    return res.redirect('/users')
  }
});

app.get("/login", kindeClient.login(), async (req, res) => {
  return res.redirect("/");
});

app.get("/register", kindeClient.register(), (req, res) => {
	return res.redirect("/");
});

app.get("/callback", kindeClient.callback(), async(req, res) => {
  let isAuthenticated = kindeClient.isAuthenticated(req);
  while (!isAuthenticated) {
    isAuthenticated = kindeClient.isAuthenticated(req);
  }
  return res.redirect("/users");
});

const checkAuthentication = async (req, res, next) => {
  const isAuthenticated = await kindeClient.isAuthenticated(req);
  if (isAuthenticated) {
      next();
  } else {
      res.redirect("/login")
  }
};

app.get('/supportpage', supportAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'supporttest.html'));
});

app.get('/supportvb', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'supportvb.html'));
});

app.get('/supportuserpage', async(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'supportusertest.html'));
});

app.get('/supportvbuser', async(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'supportvbuser.html'));
});

app.get('/cmbettingapi/setsupportinfo', async(req, res) => {

  const userid = req.query.userid;
  const email = req.query.email;
  const phone = req.query.phone;
  const fullName = req.query.fullname;

  req.session.supportID = userid;
  req.session.email = email;
  req.session.phone = phone;
  req.session.supportfullName = fullName;

  req.session.save();
  
})

app.get('/cmbettingapi/getkindeuserinfo', checkAuthentication, async(req, res) => {

  const userRes = await kindeClient.getUserDetails(req); 

  const userid = userRes.id;
  const firstName = userRes.given_name;
  const lastName = userRes.family_name;
  const email = userRes.email;
  const fullName = `${lastName}, ${firstName}`;

  res.send({ userid: userid, fullname: fullName, email: email });

});

app.get('/users', authenticateWelcome, checkAuthentication, async (req, res) => {
  const userRes = await kindeClient.getUserDetails(req); 
  const userid = userRes.id;
  const first_name = userRes.given_name;
  const last_name = userRes.family_name;

  const fullName = `${first_name} ${last_name}`;

  req.session.userid = userid;
  req.session.fullName = fullName;

  req.session.save();
  let isAuthenticated = kindeClient.isAuthenticated(req);
  while (!isAuthenticated) {
    isAuthenticated = kindeClient.isAuthenticated(req);
  }
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/test', async(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'supporttest.html'));
});

app.get('/affiliate', authenticateWelcome, checkAuthentication, (req, res) => {
  let isAuthenticated = kindeClient.isAuthenticated(req);
  while (!isAuthenticated) {
    isAuthenticated = kindeClient.isAuthenticated(req);
  }
  res.sendFile(path.join(__dirname, 'public', 'affiliate.html'));
});

app.get('/accounts', authenticateWelcome, checkAuthentication, (req, res) => {
  let isAuthenticated = kindeClient.isAuthenticated(req);
  while (!isAuthenticated) {
    isAuthenticated = kindeClient.isAuthenticated(req);
  }
  res.sendFile(path.join(__dirname, 'public', 'bookmakers.html'));
});

app.get('/betting', authenticateWelcome, checkAuthentication, (req, res) => {
  let isAuthenticated = kindeClient.isAuthenticated(req);
  while (!isAuthenticated) {
    isAuthenticated = kindeClient.isAuthenticated(req);
  }
  res.sendFile(path.join(__dirname, 'public', 'abetting.html'));
});

app.get('/cmbettingapi/getbookmakers', async (req, res) => {

  try {
    const userid = req.session.userid;

    const get_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetbookmakers/${encodeURIComponent(userid)}`);
    const data = get_bookmaker_res.data;
    res.json({'data': data})
  } catch(error) {
    console.log('problem with getting bookmakers')
  }

});

app.get('/cmbettingapi/skipbookmaker/:bookmaker', async (req, res) => {

  const fullName = req.session.fullname;
  const bookmaker = req.params.bookmaker;
  const userid = req.session.userid;

  const add_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddbookmakerdetails/${encodeURIComponent(fullName)}/${encodeURIComponent(bookmaker)}/NA/NA/NA/${encodeURIComponent(userid)}`)
  const data = add_bookmaker_res.data;

  res.json({'data': data})

});

app.get('/cmbettingapi/getobdeposits', async(req, res) => {
  const userid = req.session.userid;

  const getOBDepositsRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getobdeposits/${userid}`)
  const data = getOBDepositsRes.data;
  res.json(data);
}); 

app.get('/cmbettingapi/addbookmaker/:bookmaker/:username/:email/:password', async (req, res) => {

  const fullName = req.session.fullName;
  const bookmaker = req.params.bookmaker;
  const username = req.params.username;
  const email = req.params.email;
  const password = req.params.password;
  const userid = req.session.userid;

  const add_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddbookmakerdetails/${encodeURIComponent(fullName)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(username)}/${encodeURIComponent(email)}/${encodeURIComponent(password)}/${encodeURIComponent(userid)}`)
  const data = add_bookmaker_res.data;

  await adminNewAccountMade(req);
  await createNotification(userid);
  
  res.json({'data': data})

});

app.get('/cmbettingapi/updatebookmaker/:bookmaker/:username/:email/:password', async (req, res) => {

  const bookmaker = req.params.bookmaker;
  const username = req.params.username;
  const email = req.params.email;
  const password = req.params.password;
  const userid = req.session.userid;

  const update_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/updatebookmakerdetails/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(email)}/${encodeURIComponent(username)}/${encodeURIComponent(password)}`)
  const data = update_bookmaker_res.data;
  
  res.json({'data': data})

});

app.get('/cmbettingapi/addbettingbookmaker/:bookmaker/:username/:email/:password/:userid', async (req, res) => {

  const bookmaker = req.params.bookmaker;
  const username = req.params.username;
  const email = req.params.email;
  const password = req.params.password;
  const userid = req.params.userid;

  const add_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/addbettingbookmakerdetails/${encodeURIComponent(bookmaker)}/${encodeURIComponent(username)}/${encodeURIComponent(email)}/${encodeURIComponent(password)}/${encodeURIComponent(userid)}`)
  const data = add_bookmaker_res.data;

  await createNotification(userid);
  
  res.json({'data': data})

});

app.get('/cmbettingapi/getbettingbookmakers/:userid', async (req, res) => {

  const userid = req.params.userid;

  const getBBookmakers = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getbettingbookmakers/${encodeURIComponent(userid)}`)
  const data = getBBookmakers.data;
  
  res.json({'data': data})

});

app.get('/cmbettingapi/getmoneyinfo', async (req, res) => {

  try {
    let userid = req.query.userID;
    if (!userid) {
      userid = req.session.userid;
    }
   

    const money_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetmoneyinfo/${encodeURIComponent(userid)}`)
    const data = money_res.data;
    
    res.json({'data': data})
  }
  catch(error) {
    console.log('problem with get money info')
  }

});

app.get('/cmbettingapi/getfundrequests', async (req, res) => {

  let userid = req.query.userID;

  if (!userid) {
    userid = req.session.userid;
  }
  
  try {
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetfundrequests/${encodeURIComponent(userid)}`)
    const data = fr_res.data;

    res.json(data)

  } catch(error) {
    console.error('error with getting fund requests');
  }
  
});

app.get('/cmbettingapi/getunfinishedfundrequests', async (req, res) => {

  const userid = req.session.userid;
  try {
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getunfinishedfundrequests/${encodeURIComponent(userid)}`)
    const data = fr_res.data;

    res.json(data);

  } catch(error) {
    console.error('error with getting fund requests');
  }
  
});

app.get('/cmbettingapi/completefundrequest/:userid/:amount', async (req, res) => {

  const userid = req.params.userid;
  const amount = req.params.amount;

  try {
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecompletefundrequest/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)
    const data = fr_res.data;
    await clientFundRequest(userid, amount);
    await removeNotification(userid);
    res.json({'data': data})
  } catch(error) {
    console.error('proble with completeing fund request', error);
  }

});

app.get('/cmbettingapi/newfundrequest/:amount', async (req, res) => {

  const userid = req.session.userid;
  const amount = req.params.amount;

  const new_fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindenewfundrequest/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)
  const data = new_fr_res.data;

  await adminFundsRequested(req);
  await createNotification(userid);

  res.json({'data': data});

});

app.get('/deposits', checkAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deposits.html'));
});

app.get('/affiliate', checkAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'affiliate.html'));
});

app.get('/cmbettingapi/affiliatedata', async (req, res) => {
  
  try {
    let userid = req.query.userID;
    if (!userid) {
      userid = req.session.userid;
    }
    
    let fullName = req.query.fullName;
    if (!fullName) {
      fullName = req.session.fullname;
    }
    
    const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaffiliatedata/${encodeURIComponent(userid)}/${encodeURIComponent(fullName)}`);
    const data = response.data;
    res.json({ 'data': data }); 

  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "An error occurred while fetching user info." });
  }

});


app.get('/cmbettingapi/getuserinfo', async (req, res) => {
  
  try {

    let userID = req.query.userId;
    if (!userID) {
      userID = req.session.userid;
    }
    
    const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecheckstatus/${encodeURIComponent(userID)}`);
    const data = response.data;
    res.json({'data': data})
  } catch (error) {
    console.log('error occured');
  }

   
});

app.get('/cmbettingapi/addcontactdetails/:fullname/:phone/:email', async(req, res) => {
  try {

    const fullName = req.params.fullname;
    const userID = req.session.userid;
    const phone = req.params.phone;
    const email = req.params.email;
    let data;
    try {

      const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeadduser/${encodeURIComponent(fullName)}/${encodeURIComponent(userID)}/${encodeURIComponent(phone)}/${encodeURIComponent(email)}`);
      data = response.data;

      await clientWelcome(phone);
      await adminWelcome(req);
      
      
    } catch(error) {
      console.error('problem with add user fetch', error)
    }

    res.json({'data': data})
  
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "An error occurred while fetching user info." });
  }
});

app.get('/cmbettingapi/hasappiledaffiliate', async(req, res) => {
  
  const userID = req.session.userid;
  
  const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/hasappliedaffiliate/${encodeURIComponent(userID)}`);
  data = response.data;
  res.json({'data': data})

});

app.get('/cmbettingapi/addaffiliate/:code/:fullName', async(req, res) => {
  
  const userID = req.session.userid;
  const code = req.params.code;
  const fullName = req.params.fullName;

  try {

    const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/addaffiliate/${encodeURIComponent(userID)}/${encodeURIComponent(code)}/${fullName}`);
    data = response.data;
    res.json({'data': data})

  } catch(error) {
    console.error('problem with add user fetch', error)
  }
});

app.get('/support', (req, res) => {
  req.session.authenticated = false;
  res.sendFile(path.join(__dirname, 'public', 'supportindex.html'));
});

app.get('/cmbettingapi/changeobprogress/:userid/:bookmaker/:status', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;
  const status = req.params.status;

  const changeOBprogressRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/changeobprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${status}`)
  const data = changeOBprogressRes.data;

  await removeNotification(userid);
  res.json(data)

});

app.get('/cmbettingapi/getobprogress/:userid/:bookmaker', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;

  const OBprogressRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getobprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const data = OBprogressRes.data;

  res.json(data);

});

app.get('/cmbettingapi/setobsession', async(req, res) => {

  const userid = req.query.userid || '';
  const fullname = req.query.fullname || '';

  req.session.obID = userid;
  req.session.obFullName = fullname;

  req.session.save();

});

app.get('/cmbettingapi/getobmoneyinfo', async(req, res) => {

  const userid = req.session.obID;

  const getOBMoneyInfo = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getobmoneyinfo/${encodeURIComponent(token)}/${encodeURIComponent(userid)}`)
  const data = getOBMoneyInfo.data;
  

  res.send(`
  <div class="basis-1/5 flex flex-col border border-green-400 gap-4 rounded text-white px-8 py-8">
            <div class="text-white text-2xl font-bold">£${data.deposits}</div>
            <div class="text-white text-lg">Total Deposits</div>
        </div>
        <div class="basis-1/5 flex flex-col border border-green-400 gap-4 rounded text-white px-8 py-8">
            <div class="text-white text-2xl font-bold">£${data.balance}</div>
            <div class="text-white text-lg">Current Total Balance</div>
        </div>
        <div class="basis-1/5 flex flex-col border border-green-400 gap-4 rounded text-white px-8 py-8">
            <div class="text-white text-2xl font-bold">£${data.balance - data.deposits}</div>
            <div class="text-white text-lg">Total Profit</div>
        </div>
  `)


});

app.get('/cmbettingapi/getobmoneyinfouser', async(req, res) => {

  const userid = req.session.userid || 'kp_5dfaef0d36fb43289420ed9a7f800a60';

  const getOBMoneyInfo = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getobmoneyinfo/${encodeURIComponent(token)}/${encodeURIComponent(userid)}`)
  const data = getOBMoneyInfo.data;

  const deposits = data.deposits*1;
  const balance = data.balance*1;

  res.send(`
  <div class="basis-1/3 bg-zinc-950 border border-zinc-700 py-8 px-4 flex flex-col gap-4 rounded">
        <div class="text-white text-2xl font-bold">£${(balance - deposits)*0.3}</div>
        <div class="text-gray-400 font-light text-lg">Profit</div>
    </div>
    <div class="basis-1/3 bg-zinc-950 border border-zinc-700 py-8 px-4 flex flex-col gap-4 rounded">
        <div class="text-white text-2xl font-bold">£${deposits}</div>
        <div class="text-gray-400 font-light text-lg">Amount Deposited</div>
    </div>
  `)

});

app.get('/cmbettingapi/getobmoneyinfojson', async(req, res) => {

  const userid = req.session.userid;

  try {
    const getOBMoneyInfo = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getobmoneyinfo/${encodeURIComponent(token)}/${encodeURIComponent(userid)}`)
    const data = getOBMoneyInfo.data;
    res.json(data);
  } catch(error) {
    
  }
  
  


});

app.get('/cmbettingapi/getoballaccounts', async(req, res) => {

  const bookmaker = req.query.bookmaker;

  const OBprogressRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getallobdetails/${encodeURIComponent(token)}/${bookmaker}`)
  const data = OBprogressRes.data;
  const users = data.records;
  
  const usersHTML = users.map(user => {
    if (user.status === 'done') {
      return ''
    }
    return  `
      <div class="flex flex-row gap-4">
          <div hx-get="/cmbettingapi/setobsession" hx-trigger="click" hx-vals='{"userid": "${user.userid}", "fullname": "${user.fullname}"}' hx-on="click:redirect('/supportvbuser')" class="border border-white rounded px-4 py-2 text-white">${user.fullname}</div>            
          <div class="text-black px-4 py-2 rounded bg-green-400 font-bold">Deposits: £${user.deposits}</div>
          <div class="text-black px-4 py-2 rounded bg-green-400 font-bold">Balance: £${user.profit}</div>
          <button class="bg-red-400 px-4 py-2 rounded text-black font-bold"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
      </div>
    `
  }).join('');


  res.send(usersHTML);

});

app.get('/cmbettingapi/getuserobaccountssupport', async(req, res) => {
  
  const userid = req.session.obID;
  const obUserAccountsres = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getuserobdetails/${encodeURIComponent(token)}/${userid}`)
  const data = obUserAccountsres.data;

  let bookmakers = data.records;
  let bookmakerNameArray = [];
  bookmakers.forEach(bookmaker => {
    bookmakerNameArray.push(bookmaker.bookmaker);
  });

  const allBookmakers = ['Bet365', 'Coral', 'WilliamHill', 'Skybet', 'Ladbrokes', '888sport', 'BetVictor'];

  allBookmakers.forEach(requiredBookmaker => { 
    if (!bookmakerNameArray.includes(requiredBookmaker)) {
      bookmakers.push({
        'bookmaker': requiredBookmaker,
        'email': 'NA',
        'password': 'NA',
        'profit': '0',
        'status': 'Not Made Yet',
        'username': 'NA',
        'deposits': '0'
      })
    }
  });
   
  const bookmakersHTML = bookmakers.map(bookmaker => {
    statusClass = ''

    if (bookmaker.status === 'Not Made Yet' || bookmaker.status === 'not started') {
      statusClass = 'text-black font-bold bg-red-400'
    } else if (bookmaker.status === 'deposited') {
      statusClass = 'text-black font-bold bg-orange-400'
    } else {
      statusClass = 'text-black font-bold bg-green-400'
    }

    return `<div class="basis-2/5 flex flex-col gap-4 items-start rounded bg-zinc-900 border border-zinc-700 px-8 py-4">
    <div class="flex flex-row gap-8 items-center">
        <div class="text-white font-bold text-2xl">${bookmaker.bookmaker}</div>
        <form hx-target='#status-select' hx-swap='outerHTML' hx-get="/cmbettingapi/obchangeprogresshtmx" hx-trigger="change" hx-vals='{"bookmaker": "${bookmaker.bookmaker}"}' action="" class="flex flex-col gap-4">
          <select id='status-select' name="status" class="${statusClass} rounded px-4 py-2 gap-2 flex flex-row">
            <option id='bookmaker-status' disabled selected class="flex flex-row gap-4">${bookmaker.status}</option>
            <option value='deposited'>deposited</option> 
            <option value='done'>done</option>
            <option value='withdrawn'>withdrawn</option>
          </select>
        </form>
    </div>
    <div class="flex flex-col gap-4 py-4 px-4 border border-zinc-700 w-[100%]">
        <div class="text-white font-bold text-lg">${bookmaker.email}</div>
        <div class="text-white font-bold text-lg">${bookmaker.username}</div>
        <div class="text-white font-bold text-lg">${bookmaker.password}</div>
    </div>
    
    <div class="flex flex-row gap-8">
      <div class='flex flex-col gap-4'>
        <div id='deposits' class="text-white border border-white rounded font-bold px-4 py-2">Deposits: £${bookmaker.deposits}</div>
        <form hx-get='/cmbettingapi/addobdeposit' hx-vals='{"bookmaker": "${bookmaker.bookmaker}"}' hx-trigger='submit' hx-target='#deposits' hx-swap='outerHTML' action="" class="flex flex-col gap-4">
            <div class="text-white font-bold">Add Deposit</div>
            <input name="amount" type="number" class="rounded px-4 py-2 text-white font-light border border-zinc-700 bg-zinc-950 transition duration-200 hover:scale-[102%]" placeholder="Enter Deposit Amount">
            <button class="text-black bg-white rounded font-bold px-4 py-2 hover:bg-gray-300 transition duration-200 hover:scale-[102%]">Add Deposit</button>
        </form>
        
      </div>
      <div class='flex flex-col gap-4'>
        <div id='profit' class="text-white border border-white rounded font-bold px-4 py-2">Current Balance: £${bookmaker.profit}</div>
        <form hx-get='/cmbettingapi/setobbalance' hx-vals='{"bookmaker": "${bookmaker.bookmaker}"}' hx-trigger='submit' hx-target='#profit' hx-swap='outerHTML' action="" class="flex flex-col gap-4">
            <div class="text-white font-bold">Set Balance</div>
            <input name="amount" class="rounded px-4 py-2 text-white font-light border border-zinc-700 bg-zinc-950 transition duration-200 hover:scale-[102%]" placeholder="Enter New Balance">
            <button class="text-black bg-white rounded font-bold px-4 py-2 hover:bg-gray-300 transition duration-200 hover:scale-[102%]">Add Profit</button>
        </form>
        
      </div>

    </div>

</div>`
  }).join('');

  res.send(bookmakersHTML)
});

app.get('/cmbettingapi/addobdeposit', async(req, res) => {

  const userid = req.session.obID;
  const bookmaker = req.query.bookmaker;
  const amount = req.query.amount;

  await axios.get(`https://cmbettingoffers.pythonanywhere.com/addobdeposit/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${amount}`)
  
  res.send(`<div id='deposits' class="text-white border border-white rounded font-bold px-4 py-2">Deposits: £${amount}</div>`)

});

app.get('/cmbettingapi/setobbalance', async(req, res) => {

  const userid = req.session.obID;
  const bookmaker = req.query.bookmaker;
  const amount = req.query.amount;

  await axios.get(`https://cmbettingoffers.pythonanywhere.com/setobbalance/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${amount}`)

  res.send(`<div id='profit' class="text-white border border-white rounded font-bold px-4 py-2">Current Balance: £${amount}</div>`)

});

app.get('/cmbettingapi/obchangeprogresshtmx', async(req, res) => {

  const userid = req.session.obID;
  const status = req.query.status;
  const bookmaker = req.query.bookmaker;

  await axios.get(`https://cmbettingoffers.pythonanywhere.com/changeobprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${status}`)

  let statusClass = ''
  if (status === 'deposited') {
    statusClass = 'bg-orange-400 text-black font-bold rounded px-4 py-2'
  } else {
    statusClass = 'bg-green-400 text-black font-bold rounded px-4 py-2'
  }

  res.send(`<select id='status-select' name="status" class="${statusClass} rounded px-4 py-2 gap-2 flex flex-row">
  <option id='bookmaker-status' disabled selected class="flex flex-row gap-4">${status}</option>
  <option value='deposited'>deposited</option> 
  <option value='done'>done</option>
  <option value='withdrawn'>withdrawn</option>
</select>`)
});

app.get('/cmbettingapi/getfundrequestshtmx', async (req, res) => {

  let userid = req.session.supportID;
  
  try {
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetfundrequests/${encodeURIComponent(userid)}`)
    const data = fr_res.data;

    const frHTML = data.fund_requests.map(fundRequest => {
      if (fundRequest.status === 'done') {
        return `
        <div class="flex flex-row gap-4 px-8 py-4 border border-green-400 bg-zinc-950 w-[50%] justify-center items-center">
                <div class="text-white">£${fundRequest.amount}</div>
            </div>
        `
      } else {
        return `
        <div id="fundRequestDiv" class="flex flex-row gap-4 px-8 py-4 border border-zinc-700 bg-zinc-950 w-[50%] justify-center items-center">
                <div class="text-white">£${fundRequest.amount}</div>
                <button hx-get='/cmbettingapi/completefundrequesthtmx' hx-trigger='click' hx-target='#fundRequestDiv' hx-vals='{"amount": "${fundRequest.amount}"}' hx-swap='outerHTML' class="text-black bg-white rounded font-bold px-4 py-2 hover:bg-gray-300 transition duration-200 hover:scale-[102%]">Complete</button>
            </div>
        `
      }
      
    }).join('');

    res.send(frHTML)
  } catch(error) {
    console.error('error with getting fund requests');
  }
  
});

app.get('/cmbettingapi/completefundrequesthtmx', async (req, res) => {

  const userid = req.session.supportID;
  const amount = req.query.amount;

  try {
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecompletefundrequest/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)
    const data = fr_res.data;
    await clientFundRequest(userid, amount);
    await removeNotification(userid);
    res.send(`<div class="flex flex-row gap-4 px-8 py-4 border border-green-400 bg-zinc-950 w-[50%] justify-center items-center">
    <div class="text-white">£${amount}</div>
</div>`)
  } catch(error) {
    console.error('proble with completeing fund request', error);
  }

});

app.get("/cmbettingapi/obuserfilldetails", (req, res) => {
  const userid = req.session.obID;
  const fullname = req.session.obFullName;

  res.send(`<div class="text-white">${fullname}</div>
  <div class="text-white">${userid}</div>`)
});

app.get('/cmbettingapi/changebookmakerprogress/:userid/:bookmaker/:status', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;
  const status = req.params.status;

  const changeProgressRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindechangeaccountprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(status)}`)
  const data = changeProgressRes.data;

  await removeNotification(userid);
  res.json({'data': data})
  
});

app.get('/cmbettingapi/checkbookmakerprogress/:userid/:bookmaker', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;

  const changeProgressRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecheckaccountprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const data = changeProgressRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/getwithdrawals/:userid/:bookmaker', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;

  const getWRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetwithdrawals/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const data = getWRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/addwithdrawl/:userid/:bookmaker/:amount', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;
  const amount = req.params.amount;

  const addWRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddwithdrawal/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}`)
  const data = addWRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/addbookmakerprofit/:userid/:bookmaker/:amount/:ratio', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;
  const amount = req.params.amount;
  const ratio = req.params.ratio;
  try {
    const addBProfitRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddbookmakerprofit/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}/${encodeURIComponent(ratio)}`)
    const data = addBProfitRes.data;

    res.json({'data': data})
  }  
  catch(error) {
    console.log(error)
  }
  
});

app.get('/cmbettingapi/checkbookmakerprofit/:userid/:bookmaker', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;

  const checkBProfitRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecheckbookmakerprofit/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const data = checkBProfitRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/getbookmakerdetails', async(req, res) => {
  let userid = req.query.userID; 
  if (!userid) {
    userid = req.session.userid;
  }
  
  try {
    const getBRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetbookmakerdetails/${encodeURIComponent(token)}/${encodeURIComponent(userid)}`)
    const data = getBRes.data;

    res.json({'data': data})
  
  } catch(error) {
    console.log(error);
  }
  
});


app.get('/cmbettingapi/singlegetbookmakerdetails/:bookmaker', async(req, res) => {

  const userid = req.session.userid;
  const bookmaker = req.params.bookmaker;

  const getSBRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/singlegetbookmakerdetails/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const SBdata = getSBRes.data;

  res.json(SBdata);
  
});

app.get('/cmbettingapi/getusers', async(req, res) => {
  
  const getUsersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetusers/${encodeURIComponent(token)}`)
  const data = getUsersRes.data;

  res.json(data);
  
});

app.get('/cmbettingapi/getusershtmx', async(req, res) => {
  const getUsersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetusers/${encodeURIComponent(token)}`)
  const data = getUsersRes.data;

  const users = data.data;

  const userHtml = users.map(user => `
      <div key='${user.userid}' hx-trigger='click' hx-get='/cmbettingapi/setsupportinfo' hx-vals='{"userid": "${user.userid}", "email": "${user.email}", "phone": "${user.phone}", "fullname": "${user.fullname}"}' hx-on="click:redirect('/supportuserpage')" class="bg-zinc-950 border border-zinc-700 py-4 px-8 flex flex-col gap-4 rounded w-[30%]"> 
        <div class="text-white font-bold">${user.fullname}</div>
        <div class="text-white">${user.phone}</div>
        <div class="text-white">${user.email}</div>
        <div class="text-white">${user.userid}</div>
      </div>
    `).join('');

  res.send(userHtml);

})

app.get('/cmbettingapi/supportuserinfo', async(req, res) => {
  
  const statusRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecheckstatus/${encodeURIComponent(req.session.supportID)}`);
  const statusData = statusRes.data;

  const contractStatus = statusData.contract;
  const bankStatus = statusData.bank;

  res.send(`<div class="flex flex-row border border-zinc-700 w-[100%] px-24 py-8 justify-between items-center">
  <div class="flex flex-col gap-2 px-16 py-8 rounded border border-zinc-700 bg-zinc-950 text-white">
      <div class="text-white text-lg">${req.session.supportfullName}</div>
      <div class="text-white text-lg">${req.session.email}</div>
      <div class="text-white text-lg">${req.session.phone}</div>
      <div class="text-white text-lg">${req.session.supportID}</div>
  </div>

  <div class="flex flex-row gap-16">
      <div class="flex flex-col gap-4 items-center">
          <div class="text-white text-lg">Bank</div>
          ${contractStatus === 'done' ? `<div class="border border-green-400 rounded text-white py-2 px-4 font-bold">${contractStatus}</div>` : `<div class="border border-red-400 rounded text-white py-2 px-4 font-bold">${contractStatus}</div>`}
          ${contractStatus !== 'done' ? `<button class="text-black bg-white rounded font-bold px-4 py-2 hover:bg-gray-300 transition duration-200 hover:scale-[102%]">Complete</button>` : ''}
      </div>
      <div class="flex flex-col gap-4 items-center">
          <div class="text-white text-lg">Contract</div>
          ${bankStatus === 'done' ? `<div class="border border-green-400 rounded text-white py-2 px-4 font-bold">${bankStatus}</div>` : `<div class="border border-red-400 rounded text-white py-2 px-4 font-bold">${bankStatus}</div>`}
          ${bankStatus !== 'done' ? `<button class="text-black bg-white rounded font-bold px-4 py-2 hover:bg-gray-300 transition duration-200 hover:scale-[102%]">Complete</button>` : ''}
      </div>
  </div>
</div>`);
})

app.get('/cmbettingapi/getmoneyinfohtmx', async(req, res) => {

  const money_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetmoneyinfo/${encodeURIComponent(req.session.supportID)}`)
  const data = money_res.data;

  res.send(`<div class="flex flex-row border border-zinc-700 w-[100%] px-24 py-8 justify-center items-center gap-8">
  <div class="flex flex-col rounded gap-4 border border-green-400 py-8 px-16 items-center">
      <div class="text-white text-2xl font-bold">Our Funds</div>
      <div class="text-white text-lg">£${data.withdrawals}</div>
  </div>
  <div class="flex flex-col rounded gap-4 border border-green-400 py-8 px-16 items-center">
      <div class="text-white text-2xl font-bold">Profit</div>
      <div class="text-white text-lg">£${data.profit}</div>
  </div>
  <div class="flex flex-col rounded gap-4 border border-green-400 py-8 px-16 items-center">
      <div class="text-white text-2xl font-bold">Owed</div>
      <div class="text-white text-lg">£${data.netposition}</div>
  </div>
</div>`)
});

app.get('/cmbettingapi/getadminnumbershtmx', async(req, res) => {
  const getNumbersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getadminnumbers/${req.session.supportID}`)
  const getNumbersdata = getNumbersRes.data;
  const numbers = getNumbersdata.numbers;

  const numbersHTMl = numbers.map(number => {
    return `<div key=${number} class="text-white text-lg">${number}</div>`
  }).join('');

  res.send(numbersHTMl);
});

app.get('/cmbettingapi/addadminnumberhtmx', async(req, res) => {

  const number = req.query.phone;

  await axios.get(`https://cmbettingoffers.pythonanywhere.com/addadminnumber/${req.session.supportID}/${number}`)

  res.send(`
  <div class="text-white text-lg">${number}</div>
  `)
});

app.get('/cmbettingapi/updatestagehtmx', async(req, res) => {
  
  const userid = req.session.supportID;
  const moveForwards = req.query.moveForwards;

  const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getstage/${userid}`)
  const data = response.data;
  const stage = data.stage*1;

  let newStage = stage;
  if (moveForwards === 'true') {
    newStage = stage + 1;
  } else {
    newStage = stage - 1;
  }

  await axios.get(`https://cmbettingoffers.pythonanywhere.com/updatestage/${userid}/${newStage}`)
  await clientMovedStage(userid);

  res.send(`
      <div id="stage-number" class="text-white text-lg rounded font-bold border border-zinc-700 px-8 py-4">Stage ${newStage}</div>
    `);

});

app.get('/cmbettingapi/getstagehtmx', async(req, res) => {
  try {
    const userid = req.session.supportID;
  
    const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getstage/${userid}`)
    const data = response.data;
    const stage = data.stage;

    res.send(`
      <div id="stage-number" class="text-white text-lg rounded font-bold border border-zinc-700 px-8 py-4">Stage ${stage}</div>
    `);

  } catch(error) {
    console.log('prolem with getting stage')
  }

});

app.get('/cmbettingapi/stagebookmakerviewhtmx', async(req, res) => {
  const userid = req.session.supportID;

  const getBookmakerDetailsRes = await axios.get(``)
});

app.get('/cmbettingapi/getbookmakerdetailshtmx', async(req, res) => {

  const userid = req.session.supportID;
  const filter = req.query.filter;

  const getBRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetbookmakerdetails/${encodeURIComponent(token)}/${userid}`)
  const data = getBRes.data;  
  
  const bookmakers = data.data; 
  let displayedBookmakers = [];

  bookmakers.forEach(async(bookmaker) => {
    if (filter !== 'skipped') {
      if (bookmaker.status === filter && bookmaker.bookmakerEmail !== 'NA') {
        displayedBookmakers.push(bookmaker);
      }
    } else {
      if (bookmaker.email === 'NA') {
        displayedBookmakers.push(bookmaker);
      }
    }
    
  });

  const bookmakersHTML = displayedBookmakers.map(bookmaker => {
   return `
      <div class="flex flex-row border border-zinc-700 bg-zinc-950 rounded w-[100%] px-16 py-8 items-center justify-between gap-8">
          <div class="text-white text-lg font-bold">${bookmaker.bookmaker}</div>
          <div class="flex flex-col gap-4">
              <div class="text-white font-bold">${bookmaker.bookmakerUsername}</div>
              <div class="text-white font-bold">${bookmaker.bookmakerEmail}</div>
              <div class="text-white font-bold">${bookmaker.bookmakerPassword}</div>
          </div>

          <div class="flex flex-col gap-4 items-stretch justify-stretch h-[100%]">
              <div id="bookmaker-withdrawal" class="text-black font-bold px-4 py-2 rounded bg-green-400">Withdrawals: £${bookmaker.withdrawals}</div>
              <form hx-get="/cmbettingapi/addwithdrawalhtmx" hx-target="#bookmaker-withdrawal" hx-vals='{"bookmaker": "${bookmaker.bookmaker}"}' hx-swap="outerHTML" action="" class="flex flex-col gap-4">
                  <div class="text-white">Add Withdrawal</div>
                  <input name="amount" type="text" class="rounded px-4 py-2 text-white font-light border border-zinc-700 bg-zinc-950 transition duration-200 hover:scale-[102%]" placeholder="Enter Withdrawal">
                  <button class="text-black bg-white rounded font-bold px-4 py-2 hover:bg-gray-300 transition duration-200 hover:scale-[102%]">Submit</button>
              </form>
          </div>
          <div class="flex flex-col gap-4 items-center justify-stretch h-[100%]">
          <div id="bookmaker-profit" class="text-black font-bold px-4 py-2 rounded bg-green-400">Profit: £${bookmaker.profit}</div>
              <form hx-get="/cmbettingapi/addbookmakerprofithtmx" hx-trigger="submit" hx-vals='{"bookmaker": "${bookmaker.bookmaker}"}' hx-target="#bookmaker-profit" hx-swap='outerHTML' action="" class="flex flex-col gap-4">
                  <div class="text-white">Add Profit</div>
                  <input name="profit" type="text" class="rounded px-4 py-2 text-white font-light border border-zinc-700 bg-zinc-950 transition duration-200 hover:scale-[102%]" placeholder="Enter Profit">
                  <input name="ratio" type="text" class="rounded px-4 py-2 text-white font-light border border-zinc-700 bg-zinc-950 transition duration-200 hover:scale-[102%]" placeholder="Enter Ratio">
                  <button class="text-black bg-white rounded font-bold px-4 py-2 hover:bg-gray-300 transition duration-200 hover:scale-[102%]">Submit</button>
              </form>
          </div>
          <div class="flex flex-col gap-4 items-center justify-stretch h-[100%]">
            <div id='bookmaker-status' class='text-white px-4 py-2 rounded border border-zinc-950 font-bold'>${bookmaker.status}</div>
            <form hx-target="#bookmaker-status" hx-vals='{"bookmaker": "${bookmaker.bookmaker}"}' hx-swap="outerHTML" hx-get="/cmbettingapi/changestatushtmx" hx-trigger="change">
              <select name="status" class="select w-full max-w-xs bg-zinc-800">
                <option disabled selected>New Status</option>
                <option>qb not placed</option> 
                <option>qb placed</option>
                <option>fb placed</option>
                <option>withdrawn</option>
                <option>not received</option>
              </select>
            <form>
          </div>
          </div>
    `
  }).join('');

  res.send(bookmakersHTML);
});

app.get('/cmbettingapi/addwithdrawalhtmx', async(req, res) => {

  
  const userid = req.session.supportID;
  const bookmaker = req.query.bookmaker;

  const getWRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetwithdrawals/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const data = getWRes.data;

  const withdrawals = data.withdrawals;
  let totalWithdrawal = 0;
  withdrawals.forEach(withdrawal => {
    const numberWithdrawal = withdrawal*1;
    totalWithdrawal += numberWithdrawal;
  });

  const amount = req.query.amount*1;

  await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddwithdrawal/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}`)

  res.send(`<div id="bookmaker-withdrawal" class="text-black font-bold px-4 py-2 rounded bg-green-400">Withdrawals: £${totalWithdrawal + amount}</div>`)
  
});


app.get('/cmbettingapi/addbookmakerprofithtmx', async(req, res) => {

  const userid = req.session.supportID;
  const bookmaker = req.query.bookmaker;

  const checkBProfitRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecheckbookmakerprofit/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const data = checkBProfitRes.data;
  const oldProfit = data.profit*1;

  const amount = req.query.profit*1;
  const ratio = req.query.ratio*1;

  try {
    await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddbookmakerprofit/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}/${encodeURIComponent(ratio)}`)
    const addedAmount = amount*ratio;

    res.send(`<div id='bookmaker-profit' class="text-black font-bold px-4 py-2 rounded bg-green-400">Profit: £${addedAmount + oldProfit}</div>`)
  }  
  catch(error) {
    console.log(error)
  }
  
});

app.get('/cmbettingapi/changestatushtmx', async(req, res) => {

  const userid = req.session.supportID;
  const newStatus = req.query.status;
  const bookmaker = req.query.bookmaker;

  await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindechangeaccountprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(newStatus)}`)

  res.send(`<div id='bookmaker-status' class='text-white px-4 py-2 rounded border border-zinc-950 font-bold'>${newStatus}</div>`)
  
});

app.get('/cmbettingapi/getusers', async(req, res) => {
  
  const getUsersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetusers/${encodeURIComponent(token)}`)
  const data = getUsersRes.data;
  res.json(data)
  
});

app.get('/cmbettingapi/completesetup/:userid/:item', async(req, res) => {

  const userid = req.params.userid;
  const item = req.params.item;

  const completeSetUpRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecompletesetup/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(item)}`)
  const data = completeSetUpRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/requestperms/:userid', async (req, res) => {
  
  const userid = req.params.userid;
  const permsRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/requestperms/${encodeURIComponent(userid)}`);
  const data = permsRes.data;

  res.json({'data': data});

});

app.get('/cmbettingapi/fetchdetails/:userid/:bookmaker', async(req, res) => {
  
  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;

  const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/havedonebookmaker/${userid}/${bookmaker}`)
  const bookmakerDetails = response.data;
  if (bookmakerDetails.success && bookmakerDetails.email !== 'NA') {
    res.json({'success': true ,'email': bookmakerDetails.email, 'username': bookmakerDetails.username, 'password': bookmakerDetails.password});
  } else {
    res.json({'success': false});
  }


});

app.get('/cmbettingapi/confirmbetting/:bookmaker', async(req, res) => {
  
  const userid = req.session.userid;
  const bookmaker = req.params.bookmaker;

  const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/addtobetting/${userid}/${bookmaker}`)
  res.json({'success': true});


});

app.get('/cmbettingapi/getperms/:userid', async (req, res) => {

  const userid = req.params.userid;

  const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/checkperm/${userid}`)
  const data = response.data;
  res.json({'perm': data.perm})

});

app.get('/cmbettingapi/getstage', async(req, res) => {
  
  try {
    let userid = req.query.userID;
    if (!userid) {
      userid = req.session.userid;
    }
    

    const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getstage/${userid}`)
    const stage = response.data;

    res.json(stage);
  } catch(error) {
    console.log('prolem with getting stage')
  }

});

app.get('/cmbettingapi/updatestage/:userid/:stage', async(req, res) => {
  
  const userid = req.params.userid;
  const stage = req.params.stage;

  const updateStageRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/updatestage/${userid}/${stage}`)
  const updateStageData = updateStageRes.data;

  await clientMovedStage(userid);

  res.json(updateStageData);

});


app.get('/cmbettingapi/getadminnumbers/:userid', async(req, res) => {
  
  const userid = req.params.userid;
  
  const getNumbersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getadminnumbers/${userid}`)
  const getNumbersdata = getNumbersRes.data;

  res.json(getNumbersdata);  
});

app.get('/cmbettingapi/addadminnumber/:userid/:number', async(req, res) => {
  const userid = req.params.userid;
  const number = req.params.number;

  const addNumberRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/addadminnumber/${userid}/${number}`)
  const addNumberdata = addNumberRes.data;

  res.json(addNumberdata);  
});


app.get('/cmbettingapi/getobdetails/:userid', async(req, res) => {
  const userid = req.params.userid;

  const getObDetails = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getobdetails/${token}/${userid}`)
  const getObData = getObDetails.data;
  res.json(getObData);  
});

app.get('/cmbettingapi/getproxydetails/:userid', async(req, res) => {
  const userid = req.params.userid;

  const getPD = await axios.get(`https://cmbettingoffers.pythonanywhere.com/getproxydetails/${token}/${userid}`)
  const getPDData = await getPD.data;
  
  res.json(getPDData);
});

async function removeNotification(userid) {
  await axios.get(`https://cmbettingoffers.pythonanywhere.com/removenotification/${userid}`)
}

async function createNotification(userid) {
  await axios.get(`https://cmbettingoffers.pythonanywhere.com/createnotification/${userid}`)
}

app.get('/cmbettingapi/checknotification/:userid', async(req, res) => {
  
  const userid = req.params.userid;
  
  const checkNotRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/checknotification/${userid}`)
  const checkNotData = checkNotRes.data;

  res.json(checkNotData);

});

app.get('/cmbettingapi/updateproxydetails/:userid/:value/:item', async(req, res) => {
  
  const userid = req.params.userid;
  const value = req.params.value;
  const item = req.params.item;

  const updatePD = await axios.get(`https://cmbettingoffers.pythonanywhere.com/updateproxydetails/${token}/${userid}/${value}/${item}`)
  const updatePDData = await updatePD.data;
  
  res.json(updatePDData);

});



app.get("/logout", kindeClient.logout());

app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});




