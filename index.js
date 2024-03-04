const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');
require("dotenv").config();
const {KindeClient, GrantType} = require("@kinde-oss/kinde-nodejs-sdk");
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

app.get('/cmbettingapi/getkindeuserinfo', checkAuthentication, async(req, res) => {

  const userRes = await kindeClient.getUserDetails(req); 

  const userid = userRes.id;
  const firstName = userRes.given_name;
  const lastName = userRes.family_name;
  const email = userRes.email;
  const fullName = `${lastName}, ${firstName}`;

  res.send({ userid: userid, fullname: fullName, email: email });

});

app.get('/users', authenticateWelcome, checkAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'users.html'));
});

app.get('/bookmakers', checkAuthentication, (req, res) => {
  let isAuthenticated = kindeClient.isAuthenticated(req);
  while (!isAuthenticated) {
    isAuthenticated = kindeClient.isAuthenticated(req);
  }
  res.sendFile(path.join(__dirname, 'public', 'bookmakers.html'));
});

app.get('/cmbettingapi/getbookmakers/:userid', async (req, res) => {

  try {
    const userid = req.params.userid;

    const get_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetbookmakers/${encodeURIComponent(userid)}`);
    const data = get_bookmaker_res.data;
    res.json({'data': data})
  } catch(error) {
    console.log('problem with getting bookmakers')
  }

});

app.get('/cmbettingapi/skipbookmaker/:fullname/:bookmaker/:userid', async (req, res) => {

  const fullName = req.params.fullname;
  const bookmaker = req.params.bookmaker;
  const userid = req.params.userid;

  const add_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddbookmakerdetails/${encodeURIComponent(fullName)}/${encodeURIComponent(bookmaker)}/NA/NA/NA/${encodeURIComponent(userid)}`)
  const data = add_bookmaker_res.data;

  res.json({'data': data})

});


app.get('/cmbettingapi/addbookmaker/:fullname/:bookmaker/:username/:email/:password/:userid', async (req, res) => {

  const fullName = req.params.fullname;
  const bookmaker = req.params.bookmaker;
  const username = req.params.username;
  const email = req.params.email;
  const password = req.params.password;
  const userid = req.params.userid;

  const add_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddbookmakerdetails/${encodeURIComponent(fullName)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(username)}/${encodeURIComponent(email)}/${encodeURIComponent(password)}/${encodeURIComponent(userid)}`)
  const data = add_bookmaker_res.data;

  await adminNewAccountMade(req);
  await createNotification(userid);
  
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

app.get('/cmbettingapi/getmoneyinfo/:userid', async (req, res) => {

  try {
    const userid = req.params.userid;

    const money_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetmoneyinfo/${encodeURIComponent(userid)}`)
    const data = money_res.data;
    
    res.json({'data': data})
  }
  catch(error) {
    console.log('problem with get money info')
  }

});

app.get('/cmbettingapi/getfundrequests/:userid', async (req, res) => {

  const userid = req.params.userid;
  try {
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetfundrequests/${encodeURIComponent(userid)}`)
    const data = fr_res.data;

    res.json(data)

  } catch(error) {
    console.error('error with getting fund requests');
  }
  
});

app.get('/cmbettingapi/getunfinishedfundrequests/:userid', async (req, res) => {

  const userid = req.params.userid;
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

app.get('/cmbettingapi/newfundrequest/:userid/:amount', async (req, res) => {

  const userid = req.params.userid;
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

app.get('/cmbettingapi/affiliatedata/:userid/:fullname', async (req, res) => {
  
  try {

    const userid = req.params.userid;
    const fullName = req.params.fullname;
    const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaffiliatedata/${encodeURIComponent(userid)}/${encodeURIComponent(fullName)}`);
    const data = response.data;
    res.json({ 'data': data }); 

  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "An error occurred while fetching user info." });
  }

});


app.get('/cmbettingapi/getuserinfo/:userid', async (req, res) => {
  
  try {

    const userID = req.params.userid;
    const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecheckstatus/${encodeURIComponent(userID)}`);
    const data = response.data;
    res.json({'data': data})
  } catch (error) {
    console.log('error occured');
  }

   
});

app.get('/cmbettingapi/addcontactdetails/:fullname/:userid/:phone/:email', async(req, res) => {
  try {

    const fullName = req.params.fullname;
    const userID = req.params.userid;
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

app.get('/cmbettingapi/hasappiledaffiliate/:userid', async(req, res) => {
  const userID = req.params.userid;
  
  const response = await axios.get(`https://cmbettingoffers.pythonanywhere.com/hasappliedaffiliate/${encodeURIComponent(userID)}`);
  data = response.data;
  res.json({'data': data})

});

app.get('/cmbettingapi/addaffiliate/:userid/:code/:fullName', async(req, res) => {
  
  const userID = req.params.userid;
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

app.get('/supportpage', supportAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'support.html'));
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

app.get('/cmbettingapi/getbookmakerdetails/:userid', async(req, res) => {

  const userid = req.params.userid;

  const getBRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetbookmakerdetails/${encodeURIComponent(token)}/${encodeURIComponent(userid)}`)
  const data = getBRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/singlegetbookmakerdetails/:userid/:bookmaker', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;

  const getSBRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/singlegetbookmakerdetails/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const SBdata = getSBRes.data;

  res.json(SBdata);
  
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

app.get('/cmbettingapi/confirmbetting/:userid/:bookmaker', async(req, res) => {
  
  const userid = req.params.userid;
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

app.get('/cmbettingapi/getstage/:userid', async(req, res) => {
  
  try {
    const userid = req.params.userid;

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
  console.log(getObData);
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




