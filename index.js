const express = require('express');
const path = require('path');
const axios = require('axios');
require("dotenv").config();
const {KindeClient, GrantType} = require("@kinde-oss/kinde-nodejs-sdk");

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
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

app.get('/users', checkAuthentication, (req, res) => {
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

  const userid = req.params.userid;

  const get_bookmaker_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetbookmakers/${encodeURIComponent(userid)}`);
  const data = get_bookmaker_res.data;
  res.json({'data': data})

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
  
  res.json({'data': data})

});

app.get('/cmbettingapi/getmoneyinfo/:userid', async (req, res) => {

  const userid = req.params.userid;

  const money_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetmoneyinfo/${encodeURIComponent(userid)}`)
  const data = money_res.data;
  
  res.json({'data': data})

});

app.get('/cmbettingapi/getfundrequests/:userid', async (req, res) => {

  const userid = req.params.userid;
  try {
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetfundrequests/${encodeURIComponent(userid)}`)
    const data = fr_res.data;
    console.log(data);
    res.json({'data': data})
  } catch(error) {
    console.error('error with getting fund requests');
  }
  
  

});

app.get('/cmbettingapi/completefundrequest/:userid/:amount', async (req, res) => {

  const userid = req.params.userid;
  const amount = req.params.amount;

  try {
    console.log(token);
    const fr_res = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecompletefundrequest/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)
    const data = fr_res.data;
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
  
  res.json({'data': data})

});

app.get('/deposits', checkAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'deposits.html'));
});

app.get('/affiliate', checkAuthentication, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'affiliate.html'));
});

app.get('/cmbettingapi/affiliatedata', async (req, res) => {
  
  try {

    const userData = await axios.get('/cmbettingapi/getkindeuserinfo');
    const userid = userData.userid;
    const fullName = userData.fullName;
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
    console.log(data);
    res.json({ 'data': data });
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "An error occurred while fetching user info." });
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
      
    } catch(error) {
      console.error('problem with add user fetch', error)
    }

    res.json({'data': data})
  
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ error: "An error occurred while fetching user info." });
  }
});


app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'support.html'));
});

app.get('/cmbettingapi/checkbookmakerprogress/:userid/:bookmaker', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;

  const progressRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecheckaccountprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
  const data = progressRes.data;

  res.json({'data': data})

});


app.get('/cmbettingapi/changebookmakerprogress/:userid/:bookmaker/:status', async(req, res) => {

  const userid = req.params.userid;
  const bookmaker = req.params.bookmaker;
  const status = req.params.status;

  const changeProgressRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindechangeaccountprogress/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(status)}`)
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

  const addBProfitRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindeaddbookmakerprofit/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}/${encodeURIComponent(ratio)}`)
  const data = addBProfitRes.data;

  res.json({'data': data})
  
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

app.get('/cmbettingapi/getusers', async(req, res) => {
  
  const getUsersRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindegetusers/${encodeURIComponent(token)}`)
  const data = getUsersRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/completesetup/:userid/:item', async(req, res) => {

  const userid = req.params.userid;
  const item = req.params.item;

  const completeSetUpRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/kindecompletesetup/${encodeURIComponent(token)}/${encodeURIComponent(userid)}/${encodeURIComponent(item)}`)
  console.log(completeSetUpRes);
  const data = completeSetUpRes.data;

  res.json({'data': data})
  
});

app.get('/cmbettingapi/transferdetails/:userid/:kuserid/:fullname', async(req, res) => {

  const userid = req.params.userid;
  console.log(userid);
  const kuserid = req.params.kuserid;
  console.log(kuserid);
  const fullname = req.params.fullname;
  console.log(fullname);

  try {
    
    const transferRes = await axios.get(`https://cmbettingoffers.pythonanywhere.com/transferdetails/${encodeURIComponent(userid)}/${encodeURIComponent(kuserid)}/${encodeURIComponent(fullname)}`)
    res.json({'sucess': true})
  } catch(error) {
    console.error(error)
  }

  
  
});

app.get("/logout", kindeClient.logout());

app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}`);
});




