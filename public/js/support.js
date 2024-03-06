async function setBackButtonListener() {
    
    let userPage = document.querySelector('.support_container.info');
    let supportHomePage = document.querySelector('.support_container.users')

    const backButton = document.querySelector('.back_button');
    backButton.addEventListener('click', function() {

        userPage.style.display = 'none';

        supportHomePage.style.display = 'flex';
        supportHomePage.style.flexDirection = 'row';

    });
}

async function setUserStatus(userid) {

    const statusRes = await fetch(`/cmbettingapi/getuserinfo/${encodeURIComponent(userid)}`)
    const statusData = await statusRes.json();

    const contract = statusData.data.contract;
    const bank = statusData.data.bank;

    let contractText = document.querySelector('#support-contract-text');
    let bankText = document.querySelector('#support-bank-text');

    contractText.textContent = contract;
    bankText.textContent = bank;

    let completeContract = document.querySelector('#support-complete-contract');
    let completeBank = document.querySelector('#support-complete-bank');

    if (contract === 'done') {
        contractText.style.border = '1px solid #17CE1A';
        completeContract.style.display = 'none';
    } else {
        
        completeContract.style.display = 'block';

        contractText.style.border = '1px solid #F29239';

        let completeContractClone = completeContract.cloneNode(true);
        completeContract.parentNode.replaceChild(completeContractClone, completeContract);

        completeContractClone.addEventListener('click', async function() {
            await fetch(`/cmbettingapi/completesetup/${userid}/contract`)
            await setUserStatus(userid);
        });
    }

    if (bank === 'done') {
        
        bankText.style.border = '1px solid #17CE1A';
        completeBank.style.display = 'none';

    } else {

        completeBank.style.display = 'block';
        bankText.style.border = '1px solid #F29239';
        
        let completeBankClone = completeBank.cloneNode(true);
        completeBank.parentNode.replaceChild(completeBankClone, completeBank);

        completeBankClone.addEventListener('click', async function() {
            await fetch(`/cmbettingapi/completesetup/${userid}/bank`)
            await setUserStatus(userid);
        });
    }
}


async function setUserInfo(userid, fullName, email, phone) {

    let fullNameText = document.querySelector('#user-page-fullname');
    let emailText = document.querySelector('#user-page-email');
    let phoneText = document.querySelector('#user-page-phone');
    let useridText = document.querySelector('#user-page-userid');

    fullNameText.textContent = fullName;
    emailText.textContent = email;
    phoneText.textContent = phone;
    useridText.textContent = userid;

}

async function setBookmakerWithdrawalListener(userid, newBookmaker, bookmaker) {

    let withdrawalForm = newBookmaker.querySelector('#support-withdrawal-form');

    withdrawalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        let amount = withdrawalForm.querySelector('#support-withdrawal-amount').value;
        
        if (amount) {
        
            await fetch(`/cmbettingapi/addwithdrawl/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}`)

        }
        await loadBookmakerWithdrawals(userid, newBookmaker, bookmaker);
        await setMoneyInfo(userid);
    });

}

async function setBookmakerProfitListener(userid, newBookmaker, bookmaker) {
    
    const profitForm = newBookmaker.querySelector('#support-profit-form');

    profitForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const amount = profitForm.querySelector('#support-profit-amount').value;
        console.log(amount);
        const ratio = profitForm.querySelector('#support-profit-ratio').value;
        console.log(ratio);

        try {
            await fetch(`/cmbettingapi/addbookmakerprofit/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}/${encodeURIComponent(ratio)}`)
        } catch(error) {
            console.log('error with adding profit', error);
        }
        await loadBookmakerProfit(userid, newBookmaker, bookmaker);
        await setMoneyInfo(userid);
    });
}

async function setBookmakerProgressListener(userid, newBookmaker, bookmaker) {

    let bookmakerProgressForm = newBookmaker.querySelector('#support-account-progress-form');
    let bookmakerStatusText = newBookmaker.querySelector('#support-bookmaker-progress');

    bookmakerProgressForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let newProgressStatus = bookmakerProgressForm.querySelector('#support-account-progress-value').value;

        await fetch(`/cmbettingapi/changebookmakerprogress/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(newProgressStatus)}`)

        bookmakerStatusText.textContent = newProgressStatus;
        if (newProgressStatus === 'qb not placed') {
            bookmakerStatusText.style.border = '1px solid #EE746E';
        } else if (newProgressStatus === 'qb placed') {
            bookmakerStatusText.style.border = '1px solid #FF954F';
        } else if (newProgressStatus === 'not received') {
            bookmakerStatusText.style.border = '1px solid #EE746E';
        } else {
            bookmakerStatusText.style.border = '1px solid #77DD77';
        }
    });

}

async function loadBookmakerProgress(userid, newBookmaker, bookmaker, filter) {
    
    const res = await fetch(`/cmbettingapi/checkbookmakerprogress/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
    const data = await res.json();

    let bookmakerStatusText = newBookmaker.querySelector('#support-bookmaker-progress');
    if (data.data.success) {

        let progressStatus = data.data.status;
        if (progressStatus === filter) {
            bookmakerStatusText.textContent = progressStatus;
            
            if (progressStatus === 'qb not placed') {
                bookmakerStatusText.style.border = '1px solid #EE746E';
            } else if (progressStatus === 'qb placed') {
                bookmakerStatusText.style.border = '1px solid #FF954F';
            } else {
                bookmakerStatusText.style.border = '1px solid #77DD77';
            }
            return true;
        } else {
            return false;
        }
    }

}

async function loadBookmakerProfit(userid, newBookmaker, bookmaker) {

    let bottomRowContainer = newBookmaker.querySelector('#support-bottom-container');
    bottomRowContainer.innerHTML = '';

    let bookmakerProfit = document.querySelector('#support-sub-template').cloneNode(true);
    let bookmakerProfitText = bookmakerProfit.querySelector('#support-sub-text');

    const res = await fetch(`/cmbettingapi/checkbookmakerprofit/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
    const data = await res.json();

    if (data.data.success) {
        const profit = data.data.profit;
        bookmakerProfitText.textContent = `Profit: £${profit}`;
        
    } else {
        bookmakerProfitText.textContent = 'Profit: £0';
    }

    bookmakerProfit.style.display = 'flex';
    bookmakerProfit.style.flexDirection = 'row';
    bookmakerProfit.style.padding = '1em';
    bookmakerProfit.style.borderRadius = '0.3em';
    bookmakerProfit.style.border = '1px solid #17CE1A'
    bottomRowContainer.appendChild(bookmakerProfit);

}

async function loadBookmakerWithdrawals(userid, newBookmaker, bookmaker) {

    let bottomRowContainer = newBookmaker.querySelector('#support-bottom-container');
    bottomRowContainer.innerHTML = '';

    let withdrawalTemplate = document.querySelector('#support-sub-template');
    

    const res = await fetch(`/cmbettingapi/getwithdrawals/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
    const data = await res.json();

    let totalWithdrawalAmount = 0.0;
    if (data.data.success) {

        data.data.withdrawals.forEach(withdrawal => {
            let newWithdrawal = withdrawalTemplate.cloneNode(true);
            const withdrawalAmount = withdrawal.amount;
            totalWithdrawalAmount += parseFloat(withdrawalAmount);

            let withdrawalText = newWithdrawal.querySelector('#support-sub-text');
            withdrawalText.textContent = `£${withdrawalAmount}`;

            newWithdrawal.style.display = 'flex';
            newWithdrawal.style.flexDirection = 'row';
            bottomRowContainer.appendChild(newWithdrawal);
        });

        let totalWithdrawals = withdrawalTemplate.cloneNode(true);
        let totalWithdrawalText = totalWithdrawals.querySelector('#support-sub-text');

        totalWithdrawalText.textContent = `Total Withdrawals: £${totalWithdrawalAmount}`;
        totalWithdrawals.style.border = '1px solid #17CE1A';

        totalWithdrawals.style.display = 'flex';
        totalWithdrawals.style.flexDirection = 'row';
        totalWithdrawals.style.padding = '1em';
        totalWithdrawals.style.borderRadius = '0.3em';
        bottomRowContainer.appendChild(totalWithdrawals);
        
    } else {

        let totalWithdrawals = withdrawalTemplate.cloneNode(true);
        let totalWithdrawalText = totalWithdrawals.querySelector('#support-sub-text');

        totalWithdrawalText.textContent = `Total Withdrawals: £0`;
        totalWithdrawals.style.border = '1px solid #17CE1A';

        totalWithdrawals.style.display = 'flex';
        totalWithdrawals.style.flexDiresction = 'row';
        totalWithdrawals.style.padding = '1em';
        totalWithdrawals.style.borderRadius = '0.3em';
        bottomRowContainer.appendChild(totalWithdrawals);
    }

}   

async function setBookmakerSubMenuListener(userid, newBookmaker, bookmaker) {

    let withdrawalSubMenu = newBookmaker.querySelector('#withdrawal-submenu');
    let profitSubMenu = newBookmaker.querySelector('#profit-submenu');

    withdrawalSubMenu.addEventListener('click', async function() {
        profitSubMenu.style.backgroundColor = 'transparent';
        withdrawalSubMenu.style.backgroundColor = '#3D3C3C';
        await loadBookmakerWithdrawals(userid, newBookmaker, bookmaker);
    });

    profitSubMenu.addEventListener('click', async function() {
        withdrawalSubMenu.style.backgroundColor = 'transparent';
        profitSubMenu.style.backgroundColor = '#3D3C3C';
        await loadBookmakerProfit(userid, newBookmaker, bookmaker);
    });


}

async function setAccountsListener(userid) {

    const accountsSubMenu = document.querySelector('#accountssubmenu');
    const accountsOptions = accountsSubMenu.querySelectorAll('.supportmenutitle');

    accountsOptions.forEach(async(accountsOption) => {  
        
        let accountsOptionClone = accountsOption.cloneNode(true);
        accountsOption.parentNode.replaceChild(accountsOptionClone, accountsOption);

        accountsOptionClone.addEventListener('click', async function() {
            let optionText = accountsOption.textContent;

            accountsOptionClone.style.backgroundColor = '#3D3C3C';
            await loadBookmakerDetails(userid, optionText);

            let otherOptions = accountsSubMenu.querySelectorAll('.supportmenutitle')
            otherOptions.forEach(otherOption => {
                if (otherOption !== accountsOptionClone) {
                    otherOption.style.backgroundColor = 'transparent';
                }
            });
            
        });
        
    });

}

async function loadBookmakerDetails(userid, filter) {
    
    const res = await fetch(`/cmbettingapi/getbookmakerdetails/${encodeURIComponent(userid)}`)
    const data = await res.json();
    
    let userInfoContainer = document.querySelector('#support-user-info-container');
    userInfoContainer.innerHTML = '';
    
    let bookmakerArray = [];
    if (data.data.success) {
        data.data.data.forEach(async(bookmakerDetails) => {
            
            let bookmaker = bookmakerDetails.bookmaker;
            bookmakerArray.push(bookmaker);
            let newBookmaker = document.querySelector('#support-account-template').cloneNode(true);
            
            let isDisplayed = false;

            if (filter === 'skipped') {
                isDisplayed = true;
            } else {
                isDisplayed = await loadBookmakerProgress(userid, newBookmaker, bookmaker, filter);
            }
            
            if (isDisplayed) {

                let bookmakerUsername = bookmakerDetails.bookmakerUsername;
                let bookmakerEmail = bookmakerDetails.bookmakerEmail;
                let bookmakerPassword = bookmakerDetails.bookmakerPassword;

                newBookmaker.querySelector('#support-bookmaker').textContent = bookmaker;
                newBookmaker.querySelector('#support-username').textContent = bookmakerUsername;
                newBookmaker.querySelector('#support-email').textContent = bookmakerEmail;
                newBookmaker.querySelector('#support-password').textContent = bookmakerPassword;

                if (filter === 'skipped' && bookmakerEmail !== 'NA') {
                    return;
                }
                
                if (filter !== 'skipped' && bookmakerEmail === 'NA') {
                    return;
                }
                
                newBookmaker.style.display = 'flex';
                newBookmaker.style.display = 'column';
                
                userInfoContainer.appendChild(newBookmaker);
                
                await setBookmakerWithdrawalListener(userid, newBookmaker, bookmaker);
                await setBookmakerProfitListener(userid, newBookmaker, bookmaker);
                await setBookmakerProgressListener(userid, newBookmaker, bookmaker);
                await setBookmakerSubMenuListener(userid, newBookmaker, bookmaker);
            }

        });
    }

    await setStageView(bookmakerArray);
}

async function setStageView(array) {

    let bookmakerTexts = document.querySelectorAll('.supportstagetext');
    bookmakerTexts.forEach(bookmakerText => {

        if (bookmakerText.classList.contains('number')) {
            return;
        }
        
        bookmakerText.style.backgroundColor = '#111';
        bookmakerText.style.color = 'white';
        bookmakerText.style.border = '1px solid #585858';

        if (array.includes(bookmakerText.textContent)) {

            bookmakerText.style.backgroundColor = '#76DD77';
            bookmakerText.style.color = '#111111';
            bookmakerText.style.border = 'none';

        } else {

            bookmakerText.style.backgroundColor = '#ED746D';
            bookmakerText.style.color = '#111111';
            bookmakerText.style.border = 'none';
        }
    });

}


async function setFundRequestListener(userid, newFR, amount) {
    let completeButton = newFR.querySelector('#support-fr-complete');
    completeButton.addEventListener('click', async function() {

        await fetch(`/cmbettingapi/completefundrequest/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)
        await loadFundRequests(userid);
        await setMoneyInfo(userid);

    });
}

async function loadFundRequests(userid) {

    const res = await fetch(`/cmbettingapi/getfundrequests/${encodeURIComponent(userid)}`)
    const data = await res.json();

    let frTemplate = document.querySelector('#support-fr-template-holder');
    let userInfoContainer = document.querySelector('#support-user-info-container');

    const amountArray = data.amount;
    const statusArray = data.status;

    if (amountArray.length !== 0) {
        for (let i=0; i < (amountArray.length); i++) {

            const amount = amountArray[i];
            const status = statusArray[i];
            let newFR = frTemplate.cloneNode(true);
 
            newFR.querySelector('#support-fr-amount').textContent = `Amount: £${amount}`;

            newFR.style.display = 'flex';
            newFR.style.flexDirection = 'row';

            if (status === 'done') {
                newFR.querySelector('#support-fr-template').style.border = '1px solid #17CE1A';
                let completeButton = newFR.querySelector('#support-fr-complete');
                completeButton.style.display = 'none';
            } else {
                newFR.querySelector('#support-fr-template').style.border = '1px solid #F29239';
            }
    
            userInfoContainer.appendChild(newFR);
            
            if (status !== 'done') {
                await setFundRequestListener(userid, newFR, amount);
            }

        }        
    } else {
        
        let newFR = frTemplate.cloneNode(true);
        newFR.querySelector('#support-fr-amount').textContent = `NO ACTIVE FUND REQUESTS`;

        newFR.style.display = 'flex';
        newFR.style.flexDirection = 'row';

        let completeButton = newFR.querySelector('#support-fr-complete');
        completeButton.style.display = 'none';

        userInfoContainer.appendChild(newFR);

    }
    
}

async function loadStage(userid) {
    
    const res = await fetch(`/cmbettingapi/getstage/${encodeURIComponent(userid)}`)
    const data = await res.json();
    const stage = data.stage;

    const supportStageText = document.querySelector('#support-stage-text');
    supportStageText.style.display = 'block';

    if (stage === null) {
        supportStageText.textContent = `Stage Not Set`;
    } else {
        supportStageText.textContent = `Stage: ${stage}`;
    }

    await moveOntoStage(userid, stage);
}

async function moveOntoStage(userid, stage) {

    const updateStageButton = document.querySelector('#update-stage-button');
    const updateStageButtonClone = updateStageButton.cloneNode(true);

    updateStageButton.parentNode.replaceChild(updateStageButtonClone, updateStageButton);

    const stageNumber = stage*1;
    updateStageButtonClone.addEventListener('click', async function() {
        await fetch(`/cmbettingapi/updatestage/${userid}/${stageNumber+1}`)
        await loadStage(userid);
    });
    
}

async function displayAdminPhones(userid) {
    
    const res = await fetch(`/cmbettingapi/getadminnumbers/${encodeURIComponent(userid)}`);
    const data = await res.json();
    const numbers = data.numbers;
    const phoneNumberContainer = document.querySelector('#support-phone-container');
    phoneNumberContainer.innerHTML = '';

    if (numbers.length === 0) {
        const newPhoneNumber = document.querySelector('#support-phone-text').cloneNode(true);
        newPhoneNumber.textContent = 'No Admin Numbers';
        newPhoneNumber.style.display = 'block';
        phoneNumberContainer.appendChild(newPhoneNumber);
    } else {
        numbers.forEach(number => {
            const newPhoneNumber = document.querySelector('#support-phone-text').cloneNode(true);
            newPhoneNumber.textContent = number;
            newPhoneNumber.style.display = 'block';
            phoneNumberContainer.appendChild(newPhoneNumber);
        });
    }
    setPhoneNumberListner(userid);

}

async function setPhoneNumberListner(userid) {

    const addPhoneForm = document.querySelector('#support-phone-form');
    const addPhoneClone = addPhoneForm.cloneNode(true);

    addPhoneForm.parentNode.replaceChild(addPhoneClone, addPhoneForm);

    addPhoneClone.addEventListener('submit', async function(e) {
        e.preventDefault();

        const newNumber = addPhoneClone.querySelector('#support-phone-value').value;
        await fetch(`/cmbettingapi/addadminnumber/${userid}/${newNumber}`)

        await displayAdminPhones(userid);
    });
}

async function setMainMenuListener(userid, fullName) {

    const accountsSubMenu = document.querySelector('#accountssubmenu');

    const obMenuButton = document.querySelector('#support-menu-ob');
    const newOBButton = obMenuButton.cloneNode(true);
    obMenuButton.parentNode.replaceChild(newOBButton, obMenuButton);
    
    const accountsMenuButton = document.querySelector('#support-menu-accounts');
    const newAccountsButton = accountsMenuButton.cloneNode(true);
    accountsMenuButton.parentNode.replaceChild(newAccountsButton, accountsMenuButton);

    const frMenuButton = document.querySelector('#support-menu-fr');
    const newFRMenuButton = frMenuButton.cloneNode(true);
    frMenuButton.parentNode.replaceChild(newFRMenuButton, frMenuButton);

    const affiliateMenuButton = document.querySelector('#support-menu-affiliate');
    const newAffiliateMenuButton = affiliateMenuButton.cloneNode(true);
    affiliateMenuButton.parentNode.replaceChild(newAffiliateMenuButton, affiliateMenuButton);

    let userInfoContainer = document.querySelector('#support-user-info-container');

    newAccountsButton.addEventListener('click', async function() {
        accountsSubMenu.style.display = 'flex';
        accountsSubMenu.style.flexDirection = 'row';
        await setAccountsListener(userid);

        newAccountsButton.style.backgroundColor = '#3D3C3C';
        newFRMenuButton.style.backgroundColor = 'transparent';
        newAffiliateMenuButton.style.backgroundColor = 'transparent';
        newOBButton.style.backgroundColor = 'transparent';
        
        userInfoContainer.innerHTML = '';
        await loadBookmakerDetails(userid);
    });

    newFRMenuButton.addEventListener('click', async function() {
        
        accountsSubMenu.style.display = 'none';
        newFRMenuButton.style.backgroundColor = '#3D3C3C';
        newAccountsButton.style.backgroundColor = 'transparent';
        newAffiliateMenuButton.style.backgroundColor = 'transparent';
        newOBButton.style.backgroundColor = 'transparent';

        userInfoContainer.innerHTML = '';
        await loadFundRequests(userid);
    });
    
    newAffiliateMenuButton.addEventListener('click', async function() {
        newAffiliateMenuButton.style.backgroundColor = '#3D3C3C';
        newFRMenuButton.style.backgroundColor = 'transparent';
        newAccountsButton.style.backgroundColor = 'transparent';
        newOBButton.style.backgroundColor = 'transparent';

        accountsSubMenu.style.display = 'none';

        userInfoContainer.innerHTML = '';
        await loadAffiliate(userid, fullName);
    });

    newOBButton.addEventListener('click', async function() {
        
        newOBButton.style.backgroundColor = '#3D3C3C';
        accountsSubMenu.style.display = 'none';
        newFRMenuButton.style.backgroundColor = 'transparent';
        newAffiliateMenuButton.style.backgroundColor = 'transparent';
        newAccountsButton.style.backgroundColor = 'transparent';

        userInfoContainer.innerHTML = '';
        await loadOB(userid);
    });

}

async function loadAffiliate(userid, fullName) {

    let userInfoContainer = document.querySelector('#support-user-info-container');

    const res = await fetch(`/cmbettingapi/affiliatedata/${encodeURIComponent(userid)}/${encodeURIComponent(fullName)}`)
    const data = await res.json()

    let userTemplate = document.querySelector('#affiliate-template');
    if (data.data.success) {
        const usersSignedUp = data.data.userdata;
        usersSignedUp.forEach(userSignedUp => {
            const newUser = userTemplate.cloneNode(true);

            newUser.querySelector('#affiliate-name').textContent = userSignedUp.fullname;
            let accountMadeTitle = newUser.querySelector('#affiliate-accounts-made');
            accountMadeTitle.textContent = userSignedUp.accounts_made;
            const accountsMade = userSignedUp.accounts_made * 1
            
            if (accountsMade > 9) {
                accountMadeTitle.style.backgroundColor = '#19ce19';
            }

            newUser.style.display = 'flex';
            newUser.style.flexDirection = 'row';

            newUser.style.backgroundColor = '#111111';
            newUser.style.padding = '2em';
            newUser.style.gap = '5em';
            newUser.style.border = '1px solid #585858';
            newUser.style.borderRadius = '0.3em';
            newUser.style.justifyContent = 'center'; 

            userInfoContainer.appendChild(newUser);
        });
    }
}

async function setProxyListeners(userid, newOB) {
    
    const providerForm = newOB.querySelector('#proxy-provider-form');

    providerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const providerValue = providerForm.querySelector('#proxy-provider-value').value;
        await fetch(`/cmbettingapi/updateproxydetails/${userid}/${providerValue}/provider`)
        
        newOB.querySelector('#proxy-provider').textContent = providerValue;
    });

    const cityForm = newOB.querySelector('#proxy-country-form');

    cityForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const cityValue = cityForm.querySelector('#proxy-country-value').value;
        await fetch(`/cmbettingapi/updateproxydetails/${userid}/${cityValue}/city`)
        
        newOB.querySelector('#proxy-country').textContent = cityValue;
    });

    const VMUsernameForm = newOB.querySelector('#vm-username-form');

    VMUsernameForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const usernameValue = VMUsernameForm.querySelector('#vm-username-value').value;
        await fetch(`/cmbettingapi/updateproxydetails/${userid}/${usernameValue}/username`)
        
        newOB.querySelector('#vm-username').textContent = usernameValue;
    });

    const passwordForm = newOB.querySelector('#vm-password-form');

    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const passwordValue = passwordForm.querySelector('#vm-password-value').value;
        await fetch(`/cmbettingapi/updateproxydetails/${userid}/${passwordValue}/password`)
        
        newOB.querySelector('#vm-password').textContent = passwordValue;
    });
}

async function loadOB(userid) {

    const userInfoContainer = document.querySelector('#support-user-info-container')
    const OBTemplate = document.querySelector('#proxy-template');
    const newOB = OBTemplate.cloneNode(true);

    const res = await fetch(`/cmbettingapi/getproxydetails/${userid}`)
    const data = await res.json();

    let city = data.city;
    let provider = data.provider;
    let password = data.password;
    let username = data.username;

    if (city === null) {
        city = 'Proxy City'
    }
    if (provider === null) {
        provider = 'Proxy Provider'
    }
    if (password === null) {
        password = 'VM Password'
    }
    if (username === null) {
        username = 'VM Username'
    }
    newOB.querySelector('#proxy-country').textContent = city;
    newOB.querySelector('#proxy-provider').textContent = provider;
    newOB.querySelector('#vm-username').textContent = username;
    newOB.querySelector('#vm-password').textContent = password;

    newOB.style.display = 'flex';
    newOB.style.flexDirection = 'row';

    await setProxyListeners(userid, newOB);

    userInfoContainer.appendChild(newOB);

    await getOBAccounts(userid);

}

async function getOBAccounts(userid) {

    const userInfoContainer = document.querySelector('#support-user-info-container');
    const newAccountTemplate = document.querySelector('#support-account-template');

    const getBookmakersRes = await fetch(`/cmbettingapi/getbettingbookmakers/${userid}`)
    const getBookmakerData = await getBookmakersRes.json();
    
    const bookmakers = getBookmakerData.data.bookmakers;
    
    const getDetailsRes = await fetch(`/cmbettingapi/getbookmakerdetails/${encodeURIComponent(userid)}`)
    const getDetailsJson = await getDetailsRes.json();

    const bookmakerDetails = getDetailsJson.data.data;
    bookmakerDetails.forEach(async(bookmakerDetail) => {
        const haveDetails = bookmakers.includes(bookmakerDetail.bookmaker);
        if (haveDetails) {
    
            const email = bookmakerDetail.bookmakerEmail;
            const password = bookmakerDetail.bookmakerPassword;
            const username = bookmakerDetail.bookmakerUsername;

            let newBookmaker = newAccountTemplate.cloneNode(true);

            newBookmaker.querySelector('#support-password').textContent = password;
            newBookmaker.querySelector('#support-username').textContent = username;
            newBookmaker.querySelector('#support-email').textContent = email;
            newBookmaker.querySelector('#support-bookmaker').textContent = bookmakerDetail.bookmaker;

            newBookmaker.style.display = 'flex';
            newBookmaker.style.flexDirection = 'column';

            await findOBStatus(userid, bookmakerDetail.bookmaker, newBookmaker);
            await setOBStatusListener(userid, bookmakerDetail.bookmaker, newBookmaker);

            const optionsForm = newBookmaker.querySelector('#support-account-progress-form');
            const optionsSelect = optionsForm.querySelector('#support-account-progress-value');
            
            optionsSelect.options.length = 0;

            const option0 = new Option('Select Value', '');
            const option1 = new Option('Not started', 'not-started');
            const option2 = new Option('Deposited', 'deposited');
            const option3 = new Option('Banned', 'banned');
            const option4 = new Option('Withdrawn', 'withdrawn');

            optionsSelect.add(option0)
            optionsSelect.add(option1)
            optionsSelect.add(option2)
            optionsSelect.add(option3)
            optionsSelect.add(option4)


            userInfoContainer.appendChild(newBookmaker);
        }
    });

}

async function findOBStatus(userid, bookmaker, newBookmaker) {
    const res = await fetch(`/cmbettingapi/getobprogress/${userid}/${bookmaker}`)    
    const data = await res.json();

    const status = data.status;
    const statusText = newBookmaker.querySelector('#support-bookmaker-progress');

    if (status === null) {
        statusText.textContent = 'Not Started';
        statusText.style.border = '1px solid #ED746D';
    } else {
        statusText.textContent = status;
        
        if (status !== 'withdrawn') {
            statusText.style.border = '1px solid #FF954E';
        } else {
            statusText.style.border = '1px solid #17CE1A';
        }

    }
}

async function setOBStatusListener(userid, bookmaker, newBookmaker) {
    const statusForm = newBookmaker.querySelector('#support-account-progress-form');
    if (!statusForm.classList.contains('event')) {
        statusForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const statusValue = statusForm.querySelector('#support-account-progress-value').value;
            await fetch(`/cmbettingapi/changeobprogress/${userid}/${bookmaker}`);
            
            const statusText = newBookmaker.querySelector('#support-bookmaker-progress');
            statusText.textContent = statusValue;

            statusForm.classList.add('event');
        });
    }
}

async function setMoneyInfo(userid) {

    const res = await fetch(`/cmbettingapi/getmoneyinfo/${encodeURIComponent(userid)}`)
    const data = await res.json();

    let withdrawalsText = document.querySelector('#support-ourfunds-text');
    let profitText = document.querySelector('#support-profit-text');
    let owedText = document.querySelector('#support-owed-text');

    const profit = data.data.profit;
    const withdrawals = data.data.withdrawals;
    const netPosition = data.data.netposition;

    withdrawalsText.textContent = `£${withdrawals}`;
    profitText.textContent = `£${profit}`;
    owedText.textContent = `£${netPosition}`;

}

async function setStageShowListener() {

    const showStageButton = document.querySelector('#supshowstage');
    const showStageClone = showStageButton.cloneNode(true);
    showStageButton.parentNode.replaceChild(showStageClone, showStageButton);

    const allStagesHolder = document.querySelector('#supallstages');
    
    showStageClone.addEventListener('click', function() {
        const allStagesStyle = window.getComputedStyle(allStagesHolder);
        if (allStagesStyle.display === 'none') {
            allStagesHolder.style.display = 'flex';
            allStagesHolder.style.flexDirection = 'column';

            showStageClone.textContent = 'Hide Stages';
        } else {
            allStagesHolder.style.display = 'none';

            showStageClone.textContent = 'Show Stages';
        }

    });

}

async function setUpUserPage(userid, fullName, email, phone) {

    await setBackButtonListener();    
    await setStageShowListener();
    await setUserInfo(userid, fullName, email, phone);
    await setUserStatus(userid);
    await setMoneyInfo(userid);
    await displayAdminPhones(userid);
    await loadStage(userid);
    await loadBookmakerDetails(userid, 'qb not received');
    await setAccountsListener(userid);
    await setMainMenuListener(userid, fullName);

}

async function setUserListener(newUser, userid, fullName, email, phone) {

    let userPage = document.querySelector('.support_container.info');
    let supportHomePage = document.querySelector('.support_container.users')

    newUser.addEventListener('click', async function() {
        userPage.style.display = 'flex';
        userPage.style.flexDirection = 'column';

        supportHomePage.style.display = 'none';

        await setUpUserPage(userid, fullName, email, phone);

    });
}

async function getUsers() {

    const res = await fetch('/cmbettingapi/getusers')
    const data = await res.json();
    const usersArray = data.data;

    let userTemplate = document.querySelector('#support-user');
    let rowContainer = document.querySelector('#support-container-row');
    let supportContainer = document.querySelector('#support-container');

    let newRowContainer;
    let userIndex = 0;
    let idArray = [];

    usersArray.forEach(user => {

        if (userIndex % 3 === 0) {
            newRowContainer = rowContainer.cloneNode(true);
            supportContainer.appendChild(newRowContainer);
        }

        const email = user.email;
        const fullName = user.fullname;
        const phone = user.phone;
        const userid = user.userid;

        let newUser = userTemplate.cloneNode(true);

        newUser.querySelector('#support-fullname').textContent = fullName;
        newUser.querySelector('#support-phone').textContent = email;
        newUser.querySelector('#support-email').textContent = phone;
        
        let userIDClone = newUser.querySelector('#support-email').cloneNode(true);
        userIDClone.id = 'support-userid-hidden';
        userIDClone.textContent = userid;

        userIDClone.style.display = 'none';
        newUser.appendChild(userIDClone);

        newUser.style.display = 'flex';
        newUser.style.flexDirection = 'column';

        newUser.style.width = '30%';

        idArray.push(userid);

        newRowContainer.appendChild(newUser);
        setUserListener(newUser, userid, fullName, email, phone);
        userIndex ++;
    });

    const userHolders = document.querySelectorAll('#support-user');
    userHolders.forEach(async(userHolder) => {

        let useridText = userHolder.querySelector('#support-userid-hidden');
        if (!useridText) {
            return;
        }   
        const userid = useridText.textContent;

        const notiRes = await fetch(`/cmbettingapi/checknotification/${userid}`);
        const notiData = await notiRes.json();

        if (notiData.hasNotification) {
            userHolder.style.border = '1px solid #FE954F';
        }

    });
}


document.addEventListener("DOMContentLoaded", async function() {
    await getUsers();
});