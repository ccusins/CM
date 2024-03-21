const stage1Bookmakers = [{
    bookmaker: 'Coral',
    link: new URL('https://sports.coral.co.uk/promotions/details/new-customer-offer'),
    depositAmount: 5
}, {
    bookmaker: 'Skybet',
    link: new URL('https://m.skybet.com/lp/acq-bet-x-get-20-v2'),
    depositAmount: 5
}, {
    bookmaker: 'Ladbrokes',
    link: new URL('https://sports.ladbrokes.com/promotions/details/BET5GET20'),
    depositAmount: 5
}, {
    bookmaker: 'Betfred',
    link: new URL('https://www.betfred.com/promotions/sports/welcome-offer-bet-10-get-30'),
    depositAmount: 10
}, {
    bookmaker: 'Virgin Bet',
    link: new URL('https://www.virginbet.com/promotions/637ceb119d81c3018cdf3e2e'),
    depositAmount: 10
}, {
    bookmaker: 'Bet365',
    link: new URL('https://extra.bet365.com/promotions/en'),
    depositAmount: 10
}, {
    bookmaker: 'Kwiff',
    link: new URL('https://welcome.kwiff.com/'),
    depositAmount: 10
}, {
    bookmaker: 'BetUk',
    link: new URL('https://www.betuk.com/promotions/exclusive-free-bet-offer'),
    depositAmount: 10
}, {
    bookmaker: 'WilliamHill',
    link: new URL('https://promotion.williamhill.com/uk/sports/football/aff/r30'),
    depositAmount: 10
}, {
    bookmaker: 'Tote',
    link: new URL('https://offers.tote.co.uk/'),
    depositAmount: 10
},]

const stage2Bookmakers = [{
    bookmaker: 'Paddypower',
    link: new URL('https://promotions.paddypower.com/prs/pp-uk-sports-acq-aff-b10g40-football-generic?utm_medium=Partnerships&utm_campaign=126997&utm_source=18070&utm_content=4661665&utm_ad=369307_&btag=10567349_20240320225659920920000&subid=jiuMTiPmMQ&type=bookie_offer_rest&AFF_ID=10567349&clkID=10567349_20240320225659920920000&rfr=5019422&pid=10567349&bid=7309&ttp=111'),
    depositAmount: 10
},{
    bookmaker: 'Parimatch',
    link: new URL('https://www.parimatch.co.uk/en-gb/offer/YP82/92904'),
    depositAmount: 30
}, {
    bookmaker: 'Midnite',
    link: new URL('https://welcome.midnite.com/uk-football-23-24?'),
    depositAmount: 10
}, {
    bookmaker: 'BetMGM',
    link: new URL('https://www.betmgm.co.uk/promotions/sports/welcome-offer'),
    depositAmount: 10
}, {
    bookmaker: 'Sporting Index',
    link: new URL('https://www.sportingindex.com/offers/bet-10-get-20/'),
    depositAmount: 10
}, {
    bookmaker: 'Betfair Exchange',
    link: new URL('https://promos.betfair.com/promotion?promoCode=ACQZBHC01B5G20'),
    depositAmount: 5
}, {
    bookmaker: 'BetVictor',
    link: new URL('https://www.betvictor.com/en-gb/offer/UV83'),
    depositAmount: 10
}, {
    bookmaker: 'SpreadEx',
    link: new URL('https://www.spreadex.com/sports/offers/betting-sign-up-offer/'),
    depositAmount: 25
}, {
    bookmaker: 'Unibet',
    link: new URL('https://www.unibet.co.uk/registration'),
    depositAmount: 40
}, {
    bookmaker: 'Grosvenor Sports',
    link: new URL('https://www.grosvenorcasinos.com/promotions/welcome-bonus-20-lo'),
    depositAmount: 20
}, {
    bookmaker: 'LeoVegas',
    link: new URL('https://www.leovegas.com/en-gb/promotions/bonuses/shttps://offers.tote.co.uk/'),
    depositAmount: 10
}, {
    bookmaker: 'Rhino Bet',
    link: new URL('https://rhino.bet/?promo=twenty-20&stag=32067_65fb6948cc587caeda16cab2'),
    depositAmount: 20
},]


const stage3Bookmakers = [{
    bookmaker: 'Bwin',
    link: new URL('https://promo.bwin.com/en/promo/lp/sports/generic?productId=SPORTSBOOK&trid='),
    depositAmount: 20
}, {
    bookmaker: 'Fafabet',
    link: new URL('https://www.fafabet.co.uk/promotions/welcomeoffer/'),
    depositAmount: 100
}, {
    bookmaker: 'SportingBet',
    link: new URL('https://promo.sportingbet.com/en/promo/p/sports/uk/welcome-challenge'),
    depositAmount: 70
}]


const stage4Bookmakers = [{
    bookmaker: 'Talk Sport',
    depositAmount: 40
}, {
    bookmaker: 'Boyle Sports',
    depositAmount: 10
}, {
    bookmaker: 'CopyBet',
    depositAmount: 40
},
{
    bookmaker: 'Hollywood Bets',
    depositAmount: 20
},
{
    bookmaker: 'BresBet',
    link: new URL('https://bresbet.com/?promo=welcome25-4-11-23'),
    depositAmount: 50
},
{
    bookmaker: 'Bet Goodwin',
    link: new URL('https://betgoodwin.co.uk/promotions/first_day_losses/?btag=a_41150b_18753c_'),
    depositAmount: 50
}, {
    bookmaker: 'Quinn Bet',
    link: new URL('https://www.quinnbet.com/promotions/betting-offer-uk/'),
    depositAmount: 70
}, {
    bookmaker: 'Fitzdares',
    link: new URL('https://fitzdares.com/offers/2024-new-member-offer/'),
    depositAmount: 50
}]

async function loadFundRequests(userid, stageHolder, amount) {

    let nbContainer = stageHolder.querySelector('.nb_container');
    let texts = nbContainer.querySelectorAll('.text.nb')
    let fundsRequestButton = stageHolder.querySelector('.nb_button');

    const res = await fetch(`/cmbettingapi/getunfinishedfundrequests/${encodeURIComponent(userid)}`)
    const data = await res.json();

    if (data.success) {

        for (let textIndex = 0; textIndex < texts.length; textIndex++) {
            if (textIndex === 1) {
                texts[textIndex].textContent = 'Funds were requested successfully - please wait for them to be provided to continue. Do not make any accounts in the meantime.';
                texts[textIndex].style.fontWeight = "bold";
                texts[textIndex].style.color = "#303030";        
            } else {
                texts[textIndex].style.display = 'none';
            }
        }

        fundsRequestButton.style.display = 'none';
        nbContainer.style.backgroundColor = '#FF954F';
        nbContainer.style.border = 'none';
            
    } else {
        await setFundRequestListner(userid, stageHolder, amount);
    }
}

async function setFundRequestListner(userid, stageHolder, amount) {

    let fundRequestButton = stageHolder.querySelector('.nb_button');
    

    if (!fundRequestButton.classList.contains('event')) {
        fundRequestButton.addEventListener('click', async function() {
            
            fundRequestButton.style.display = 'none';
            await fetch(`/cmbettingapi/newfundrequest/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)

            await loadFundRequests(userid, stageHolder);
        });
    }
    fundRequestButton.classList.add('event');
}

async function bookmakerListener(userid, fullName, bookmakerHolder) {
    
    let showFormButton = bookmakerHolder.querySelector('.show_form');
    let addDetailsFormOG = bookmakerHolder.querySelector('.bookmaker_form');

    let formVisible = false;

    showFormButton.addEventListener('click', function() {
        if (!formVisible) {
            addDetailsForm.style.display = 'block';
            formVisible = true;
        } else {
            addDetailsForm.style.display = 'none';
            formVisible = false;
        }
    });
    
    let bookmaker = bookmakerHolder.querySelector('.bookmaker_title').textContent;

    const addDetailsForm = addDetailsFormOG.cloneNode(true);
    addDetailsFormOG.parentNode.replaceChild(addDetailsForm, addDetailsFormOG);

    addDetailsForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        let formSubmitButton = addDetailsForm.querySelector('.form_submit_button'); 
        formSubmitButton.style.display = 'none';

        let pendingDiv = document.querySelector('.form_pending').cloneNode(true);
        pendingDiv.style.display = 'block';
        addDetailsForm.append(pendingDiv); 
        

        let username = addDetailsForm.querySelector('.text_field.username').value;
        let accountSetting = addDetailsForm.querySelector('.text_field.account_setting').value;
        let email = addDetailsForm.querySelector('.text_field.email').value;

        await fetch(`/cmbettingapi/addbookmaker/${encodeURIComponent(fullName)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(username)}/${encodeURIComponent(email)}/${encodeURIComponent(accountSetting)}/${encodeURIComponent(userid)}`)
        pendingDiv.style.display = 'none';
        addDetailsForm.style.display = 'none';
        await setBookmakerToDone(userid, bookmakerHolder, false);

        
    });
    
}

async function setSkipListner(userid, fullName, bookmakerHolder) {

    let skipButtonOG = bookmakerHolder.querySelector('#skip-bookmaker-button');
    const skipButton = skipButtonOG.cloneNode(true);
    skipButtonOG.parentNode.replaceChild(skipButton, skipButtonOG);
    
    skipButton.addEventListener('click', async function() {
        skipButton.style.display = 'none';
        let bookmaker = bookmakerHolder.querySelector('.bookmaker_title').textContent;
        await fetch(`/cmbettingapi/skipbookmaker/${encodeURIComponent(fullName)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(userid)}`)
        await setBookmakerToDone(userid, bookmakerHolder, true);
        
    });
    
}

async function setBookmakerToDone(userid, bookmakerHolder, makeVisible) {


    bookmakerHolder.style.border = '1px solid #76dd77';
    const bookmakerTitle = bookmakerHolder.querySelector('.bookmaker_title');
    const bookmaker = bookmakerTitle.textContent;
    let link = bookmakerHolder.querySelector('.bookmaker_link');
    let showFormButton = bookmakerHolder.querySelector('.show_form');

    if (link) {
        link.style.display = 'none';
    }
    const texts = bookmakerHolder.querySelectorAll('.text');
    if (texts) {
        texts.forEach(text => {
            text.style.display = 'none';
        });
    }
    showFormButton.style.display = 'none';

    let waitForFundsText = bookmakerHolder.querySelector('.disabled_ag_text');
    waitForFundsText.style.display = 'none';
    let statusHolder = bookmakerHolder.querySelector('.bookmaker_status_holder');
    let statusText = bookmakerHolder.querySelector('.bookmaker_status_title');

    statusHolder.style.display = 'block';

    let skipButton = bookmakerHolder.querySelector('#skip-bookmaker-button');
    skipButton.style.display = 'none';

    statusText.textContent = 'DONE';
    statusText.style.color = 'white';    
    statusHolder.style.backgroundColor = 'transparent';
    statusHolder.style.border = '1px solid #77DD77';
    
    if (!bookmakerHolder.classList.contains('done')) {
        const res = await fetch(`/cmbettingapi/singlegetbookmakerdetails/${userid}/${bookmaker}`)
        const data = await res.json();

        const bookmakerEmail = data.details.bookmakerEmail;
        const bookmakerPassword = data.details.bookmakerPassword;
        const bookmakerUsername = data.details.bookmakerUsername;

        const bookmakerEmailText = bookmakerTitle.cloneNode(true);
        bookmakerEmailText.textContent = bookmakerEmail;

        const bookmakerPasswordText = bookmakerTitle.cloneNode(true);
        bookmakerPasswordText.textContent = bookmakerPassword;

        const bookmakerUsernameText = bookmakerTitle.cloneNode(true);
        bookmakerUsernameText.textContent = bookmakerUsername;

        bookmakerHolder.appendChild(bookmakerEmailText);
        bookmakerHolder.appendChild(bookmakerPasswordText);
        bookmakerHolder.appendChild(bookmakerUsernameText);
    }
    bookmakerHolder.classList.add('done');
}

async function goToPastStage(userid, stageHolder, fullName, bookmakerArray) {

    let nbContainer = await stageHolder.querySelector('.nb_container');
    nbContainer.style.display = 'none';
    
    let bookmakerHolders = stageHolder.querySelectorAll('.bookmaker_holder');

    let bookArray = [];
    bookmakerArray.forEach(item => {
        bookArray.push(item.bookmaker);
    });


    bookmakerHolders.forEach(async (bookmakerHolder) => {
        
        const bookmakerTitle = bookmakerHolder.querySelector('.bookmaker_title').textContent;

        if (bookArray.includes(bookmakerTitle)) {
            await setBookmakerToDone(userid, bookmakerHolder, false);
        } else {
            await bookmakerListener(userid, fullName, bookmakerHolder);
            await setSkipListner(userid, fullName, bookmakerHolder);
        }

    });
}

async function dealWithStages(fullName, userid, stage, pastStage) {
    
    const response = await fetch(`/cmbettingapi/getbookmakers/${encodeURIComponent(userid)}`)
    const data = await response.json()

    let isSuccess = data.data.success;
    let bookmakers = [];

    if (isSuccess) {
        data.data.bookmakers.forEach((bookmakerItem) => {
            bookmakers.push(bookmakerItem.bookmaker);
        })
    }

    const moneyRes = await fetch(`/cmbettingapi/getmoneyinfo/${encodeURIComponent(userid)}`)
    const moneyData = await moneyRes.json();

    const stageHolder = document.querySelector('#stage-container');
    stageHolder.innerHTML = '';

    const bookmakerHolderTemplate = document.querySelector('.bookmaker_holder');
    

    let stageBookmakerArray = [];
    if (stage === 1) {
        stageBookmakerArray = stage1Bookmakers;
    } else if (stage === 2) {
        stageBookmakerArray = stage2Bookmakers;
    } else if (stage ===  3) {
        stageBookmakerArray = stage3Bookmakers;
    } else {
        stageBookmakerArray = stage4Bookmakers;
    }

    const withdrawals = moneyData.data.withdrawals;
    const profit = moneyData.data.profit;
    const netPosition = moneyData.data.netposition;

    let totalWithdrawals = document.querySelector('#deposits-withdrawal-counter')
    let profitText = document.querySelector('#deposits-profit-counter')
    let netBalanceText = document.querySelector('#deposits-net-counter')

    profitText.textContent = `£${profit}`;
    totalWithdrawals.textContent = `£${withdrawals}`;
    netBalanceText.textContent = `£${netPosition}`;

    let depositRequired = 0;

    let showForm = false;

    if (!pastStage) {

        stageBookmakerArray.forEach(async(stageBookmaker) => {
            if (!(bookmakers.includes(stageBookmaker.bookmaker))) {
                depositRequired += stageBookmaker.depositAmount;
            }
        });

        if (netPosition < depositRequired) {
            const res = await fetch(`/cmbettingapi/getunfinishedfundrequests/${encodeURIComponent(userid)}`)
            const data = await res.json();
            
            if (data.success) {

                const fundsPendingContainer = document.querySelector('.make_accounts_container.pending').cloneNode(true);    
                fundsPendingContainer.style.display = 'flex'; 
                fundsPendingContainer.style.backgroundColor = '#F29239';
                stageHolder.appendChild(fundsPendingContainer);

            } else {
                const fundsNeededContainer = document.querySelector('.nb_container').cloneNode(true);
                fundsNeededContainer.style.display = 'flex';
                fundsNeededContainer.style.flexDirection = 'column';

                fundsNeededContainer.querySelector('#acc-fundsneeded').textContent = `£${depositRequired-netPosition}`;

                const requestFundsButton = fundsNeededContainer.querySelector('.nb_button');
                requestFundsButton.addEventListener('click', async() => {
                    await fetch(`/cmbettingapi/newfundrequest/${userid}/${depositRequired-netPosition}`)
                    
                    const fundsPendingContainer = document.querySelector('#stage1-funds-pending').cloneNode(true);    
                    fundsPendingContainer.style.display = 'flex';
                    fundsPendingContainer.style.backgroundColor = '#F29239';

                    fundsNeededContainer.parentNode.replaceChild(fundsPendingContainer, fundsNeededContainer);

                });
                stageHolder.appendChild(fundsNeededContainer);
            }

        } else {
            if (stage !== 4) {
                const fundsSuccessContainer = document.querySelector('#stage1-funds-success').cloneNode(true);
                fundsSuccessContainer.style.display = 'flex';
                fundsSuccessContainer.style.flexDirection = 'column';
                stageHolder.appendChild(fundsSuccessContainer);
                showForm = true;
            } else  {
                const specialFundsContainer = document.querySelector('#stage1-special').cloneNode(true);
                specialFundsContainer.style.display = 'flex';
                specialFundsContainer.style.flexDirection = 'column';
                stageHolder.appendChild(specialFundsContainer);
                showForm = true;
            }
        
        }   
    } else {
        showForm = true;
    }

    for (let stbookmakerIndex = 0; stbookmakerIndex < stageBookmakerArray.length; stbookmakerIndex++) {

        const stageBookmaker = stageBookmakerArray[stbookmakerIndex];
        const newBookmaker = bookmakerHolderTemplate.cloneNode(true);
        newBookmaker.querySelector('.bookmaker_title').textContent = stageBookmaker.bookmaker;
        const bookmakerLink = newBookmaker.querySelector('.bookmaker_link');
        if (stageBookmaker.link) {
            bookmakerLink.setAttribute('href', stageBookmaker.link);
        } else {
            bookmakerLink.style.display = 'none';
        }
        
        

        newBookmaker.querySelector('.bookmaker_title.deposit').textContent = `£${stageBookmaker.depositAmount} Deposit`
        newBookmaker.style.display = 'flex';
        newBookmaker.style.flexDirection = 'column';
        if (stbookmakerIndex % 3 === 0) {
            const newRow = document.createElement('div');
            newRow.classList.add('acc_bookmakers_row'); 
            newRow.appendChild(newBookmaker);
            stageHolder.appendChild(newRow);
        } else {
            stageHolder.lastChild.appendChild(newBookmaker);
        }

        if (!(bookmakers.includes(stageBookmaker.bookmaker))) {
            if (showForm) {
                await bookmakerListener(userid, fullName, newBookmaker);
                newBookmaker.querySelector('.disabled_ag_text').style.display = 'none';
            } else {
                newBookmaker.querySelector('.bookmaker_link').style.display = 'none';
                newBookmaker.querySelector('.show_form').style.display = 'none';
                newBookmaker.querySelector('.bookmaker_status_holder').style.display = 'none';
            }
            await setSkipListner(userid, fullName, newBookmaker);
            
        } else {
            setBookmakerToDone(userid, newBookmaker, true);
        }
    }

    let stageperc = (((stage)/4)*100).toFixed(0);
    let progressBarFill = document.querySelector('#background-fill');
    progressBarFill.style.width = `${stageperc}%`;

    let progressBarText = document.querySelector('.progressperc');
    progressBarText.textContent = `${stageperc}%`;

    stageHolder.style.display = 'flex';
    stageHolder.style.display = 'column';

    if (!pastStage) {
        await setUpSubMenu(stage, userid, fullName, bookmakers);
    }
    
    // await checkFundsForStage(netPosition, stageHolder, userid);                        

}

async function loadAccounts(fullName, userid) {

    const stageResponse = await fetch(`/cmbettingapi/getstage/${encodeURIComponent(userid)}`)
    const stageJson = await stageResponse.json();
    let stage = stageJson.stage;

    if (stage === null) {
        stage = 1;
    }
    if (stage !== null) {
        stage = stage*1;
        await dealWithStages(fullName, userid, stage, false);
        return;
    } 

}

async function setUpSubMenu(stage, userid, fullName) {
    
    for (let i = 1; i < stage+1; i++) {

        let subMenuDiv = document.querySelector(`#submenu-${i}`);
        let menuText = subMenuDiv.querySelector('.item_title');

        if (i <= stage) {
            if (!subMenuDiv.classList.contains('event')) {
                subMenuDiv.addEventListener('click', async function() {
                    if (i < stage) {
                        await dealWithStages(fullName, userid, i, true);
                    } else {
                        await dealWithStages(fullName, userid, i, false);
                    }
                    
                });
            }
        }
        
        subMenuDiv.classList.add('event');

        if (i===stage) {
            subMenuDiv.style.backgroundColor = '#f29339';
            menuText.style.color = '#161616';
        
        } else {
            subMenuDiv.style.backgroundColor = '#19ce19';
            menuText.style.color = '#161616';
        }
    }

    
    for (let i = stage+1; i < 5; i++) {
        let subMenuDiv = document.querySelector(`#submenu-${i}`);

        let menuText = subMenuDiv.querySelector('.item_title');
        menuText.style.color = 'rgba(245, 245, 245, 0.72)';
    }


}

document.addEventListener("DOMContentLoaded", async function() {
    
    let bookmakerForms = document.querySelectorAll('.bookmaker_form');
    bookmakerForms.forEach(form => {

        form.classList.remove('w-form');
        form.removeAttribute('data-wf-page-id');
        form.removeAttribute('data-wf-element-id');

        let successDiv = form.querySelector('.form_success');
        if (successDiv) {
            successDiv.style.display = 'none';
        }

        let errorDiv = form.querySelector('.w-form-fail')
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }

    });

    let bookmakerCount = 0;
    try {
        const response = await fetch('/cmbettingapi/getkindeuserinfo');
        const userDetails = await response.json();

        const fullName = userDetails.fullname;
        const userid = userDetails.userid;


        let accountMenuButton = document.querySelector('#accounts-menu-button');
        
        accountMenuButton.addEventListener('click', async function() {

            let subMenu = document.querySelector('#sub-menu');
            const subMenuStyle = window.getComputedStyle(subMenu);
            if (subMenuStyle.display === 'none') {
                subMenu.style.display = 'flex';
                subMenu.style.display = 'column';
            }

            let accountContainer = document.querySelector('#container2');
            let containers = document.querySelectorAll('.container');
            let menuButtons = document.querySelectorAll('.menu_button.enabled');

            accountMenuButton.style.backgroundColor = '#2e2d2d';

            containers.forEach(container => {
                if (container !== accountContainer) {
                    container.style.display = 'none';
                }
            });

            menuButtons.forEach(menButton => {
                if (accountMenuButton !== menButton) {
                    menButton.style.backgroundColor = '#000000'
                }
            });
            
            accountContainer.style.display = 'flex';
            accountContainer.style.flexDirection = 'column';
            
            if (bookmakerCount !== 0) {
                return;
            } 
            await loadAccounts(fullName, userid);
            bookmakerCount ++;

        });

    } catch(error) {
        console.error('error with getting the user id', error);
    }

}); 