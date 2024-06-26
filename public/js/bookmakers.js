const stage1Bookmakers = [{
    bookmaker: 'Coral',
    link: new URL('https://promo.coral.co.uk/en/promo/pm/online-betting/bet-10-get-40?'),
    depositAmount: 10
}, {
    bookmaker: 'Skybet',
    link: new URL('https://m.skybet.com/lp/acq-bet-x-get-30'),
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
    bookmaker: 'BetVictor',
    link: new URL('https://www.betvictor.com/en-gb/offer/MI43/98859'),
    depositAmount: 10
}]

const stage2Bookmakers = [, {
    bookmaker: 'Tote',
    link: new URL('https://offers.tote.co.uk/'),
    depositAmount: 10
}, {
    
    bookmaker: 'Parimatch',
    link: new URL('https://www.parimatch.co.uk/en-gb/offer/XF11/93821'),
    depositAmount: 10
}, {
    bookmaker: 'Midnite',
    link: new URL('https://welcome.midnite.com/uk-football-23-24?'),
    depositAmount: 10
}, {
    bookmaker: 'Sporting Index',
    link: new URL('https://www.sportingindex.com/offers/bet-10-get-20/'),
    depositAmount: 10
}, {
    bookmaker: 'SpreadEx',
    link: new URL('https://www.spreadex.com/sports/offers/betting-sign-up-offer/'),
    depositAmount: 25
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
}, {
    bookmaker: 'BetMGM',
    link: new URL('https://www.betmgm.co.uk/promotions/sports/welcome-offer'),
    depositAmount: 10
}]


const stage3Bookmakers = [{
    bookmaker: 'Bwin',
    link: new URL('https://promo.bwin.com/en/promo/lp/sports/generic?productId=SPORTSBOOK&trid='),
    depositAmount: 20
}, {
    bookmaker: 'Fafabet',
    link: new URL('https://www.fafabet.co.uk/promotions/welcomeoffer/'),
    depositAmount: 100
}, {
    bookmaker: 'LiveScore Bet',
    link: new URL('https://www.livescorebet.com/uk/promotions/62bca85276bb165619a4d13b'),
    depositAmount: 10
}, {
    bookmaker: 'Unibet',
    link: new URL('https://www.unibet.co.uk/registration'),
    depositAmount: 40
}, {
    bookmaker: 'Betfair Exchange',
    link: new URL('https://promos.betfair.com/promotion?promoCode=ACQZBHC01B5G20'),
    depositAmount: 5
}, {
    bookmaker: 'Paddypower',
    link: new URL('https://promotions.paddypower.com/prs/pp-uk-sports-acq-aff-b10g40-football-generic?utm_medium=Partnerships&utm_campaign=126997&utm_source=18070&utm_content=4661665&utm_ad=369307_&btag=10567349_20240320225659920920000&subid=jiuMTiPmMQ&type=bookie_offer_rest&AFF_ID=10567349&clkID=10567349_20240320225659920920000&rfr=5019422&pid=10567349&bid=7309&ttp=111'),
    depositAmount: 10
}, {
    bookmaker: 'Betway',
    link: new URL('https://betway.com/en-gb/'),
    depositAmount: 10
}]


const stage4Bookmakers = [{
    bookmaker: 'SportingBet',
    link: new URL('https://promo.sportingbet.com/en/promo/p/sports/uk/welcome-challenge'),
    depositAmount: 70
}, {
    bookmaker: 'Talk Sport',
    depositAmount: 40
}, {
    bookmaker: 'Boyle Sports',
    depositAmount: 10
}, {
    bookmaker: 'CopyBet',
    depositAmount: 10
}]


async function bookmakerListener(fullName, bookmakerHolder) {
    
    let addDetailsFormOG = bookmakerHolder.querySelector('#details-form');

    const showDetailsButton = bookmakerHolder.querySelector('#show-details-button');
    showDetailsButton.style.display = 'none';

    let bookmaker = bookmakerHolder.querySelector('#bookmaker-title').textContent;

    const addDetailsForm = addDetailsFormOG.cloneNode(true);
    addDetailsFormOG.parentNode.replaceChild(addDetailsForm, addDetailsFormOG);

    addDetailsForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        let formSubmitButton = addDetailsForm.querySelector('#form-submit'); 
        formSubmitButton.style.display = 'none';

        let username = addDetailsForm.querySelector('#username').value;
        let accountSetting = addDetailsForm.querySelector('#password').value;
        let email = addDetailsForm.querySelector('#email').value;

        await fetch(`/cmbettingapi/addbookmaker/${encodeURIComponent(bookmaker)}/${encodeURIComponent(username)}/${encodeURIComponent(email)}/${encodeURIComponent(accountSetting)}`)

        await setBookmakerToDone(bookmakerHolder, false);

        
    });
    
}

async function setSkipListner(fullName, bookmakerHolder) {

    let skipButtonOG = bookmakerHolder.querySelector('#skip-bookmaker-button');
    const skipButton = skipButtonOG.cloneNode(true);
    skipButtonOG.parentNode.replaceChild(skipButton, skipButtonOG);
    
    skipButton.addEventListener('click', async function() {
        skipButton.style.display = 'none';
        let bookmaker = bookmakerHolder.querySelector('#bookmaker-title').textContent;  
        await fetch(`/cmbettingapi/skipbookmaker/${encodeURIComponent(bookmaker)}`)
        await setBookmakerToDone(bookmakerHolder, true);
        
    });
    
}

async function setBookmakerToDone(bookmakerHolder, makeVisible) {


    bookmakerHolder.style.border = '1px solid #76dd77';
    const bookmakerTitle = bookmakerHolder.querySelector('#bookmaker-title');
    const bookmaker = bookmakerTitle.textContent;
    let link = bookmakerHolder.querySelector('#bookmaker-link');

    if (link) {
        link.style.display = 'none';
    }

    let waitForFundsText = bookmakerHolder.querySelector('#wait-for-funds');
    waitForFundsText.style.display = 'none';
    let statusText = bookmakerHolder.querySelector('#status-text');

    let skipButton = bookmakerHolder.querySelector('#skip-bookmaker-button');
    skipButton.style.display = 'none';

    statusText.textContent = 'DONE';
    statusText.style.color = 'white';    
    statusText.style.backgroundColor = 'transparent';
    statusText.style.border = '1px solid #49DE80';
    statusText.style.display = 'block';
    
    const viewDetailsButton = bookmakerHolder.querySelector('#show-details-button');
    viewDetailsButton.style.display = 'block';

    const bookmakerForm = bookmakerHolder.querySelector('#details-form');
    bookmakerForm.style.display = 'none';

    if (!bookmakerHolder.classList.contains('done')) {
        const res = await fetch(`/cmbettingapi/singlegetbookmakerdetails/${bookmaker}`)
        const data = await res.json();

        const bookmakerEmail = data.details.bookmakerEmail;
        const bookmakerPassword = data.details.bookmakerPassword;
        const bookmakerUsername = data.details.bookmakerUsername;

        const bookmakerEmailText = bookmakerHolder.querySelector('#details-email');
        bookmakerEmailText.textContent = bookmakerEmail;

        const bookmakerPasswordText = bookmakerHolder.querySelector('#details-password');
        bookmakerPasswordText.textContent = bookmakerPassword;

        const bookmakerUsernameText = bookmakerHolder.querySelector('#details-username');
        bookmakerUsernameText.textContent = bookmakerUsername;


        viewDetailsButton.addEventListener('click', () => {
            const detailsDiv = bookmakerHolder.querySelector('#details-div');
            const computedStyle = window.getComputedStyle(detailsDiv);

            if (computedStyle.display !== 'none') {
                detailsDiv.style.display = 'none';
            } else {
                detailsDiv.style.display = 'flex';
            }
        });
    }
    bookmakerHolder.classList.add('done');
}

async function goToPastStage(stageHolder, fullName, bookmakerArray) {

    let nbContainer = await stageHolder.querySelector('#funds-info-div');
    nbContainer.style.display = 'none';
    
    let bookmakerHolders = stageHolder.querySelectorAll('#bookmaker-template');

    let bookArray = [];
    bookmakerArray.forEach(item => {
        bookArray.push(item.bookmaker);
    });


    bookmakerHolders.forEach(async (bookmakerHolder) => {
        
        const bookmakerTitle = bookmakerHolder.querySelector('#bookmaker-title').textContent;

        if (bookArray.includes(bookmakerTitle)) {
            await setBookmakerToDone(bookmakerHolder, false);
        } else {
            await bookmakerListener(fullName, bookmakerHolder);
            await setSkipListner(fullName, bookmakerHolder);
        }

    });
}

async function dealWithStages(fullName, stage, pastStage) {
    
    const response = await fetch(`/cmbettingapi/getbookmakers`)
    const data = await response.json()

    let isSuccess = data.data.success;
    let bookmakers = [];

    if (isSuccess) {
        data.data.bookmakers.forEach((bookmakerItem) => {
            bookmakers.push(bookmakerItem.bookmaker);
        })
    }

    const moneyRes = await fetch(`/cmbettingapi/getmoneyinfo`)
    const moneyData = await moneyRes.json();

    const stageHolder = document.querySelector('#stage-container');
    stageHolder.innerHTML = '';

    const bookmakerHolderTemplate = document.querySelector('#bookmaker-template');
    

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

    let totalWithdrawals = document.querySelector('#deposits-withdrawal-counter');
    let profitText = document.querySelector('#deposits-profit-counter');
    let netBalanceText = document.querySelector('#deposits-net-counter');

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

            const amountRequiredText = document.querySelector('#amount-required-text');
            amountRequiredText.textContent = `Amount Required for Deposits: £${depositRequired - netPosition}`;
            const res = await fetch(`/cmbettingapi/getunfinishedfundrequests`)
            const data = await res.json();
            
            const fundsNeededAccordion = document.querySelector('#funds-needed-accordion');
            if (data.success) {
                
                const timerSVG = document.querySelector('#timer-svg');
                timerSVG.style.display = 'block';
                fundsNeededAccordion.appendChild(timerSVG);

                fundsNeededAccordion.style.backgroundColor = '#FB923C';
                fundsNeededAccordion.style.color = 'black';

                const fundsStatus = document.querySelector('#funds-status');
                fundsStatus.textContent = 'PENDING';
                fundsStatus.style.border = '1px solid #FB923C';

                const requestFundsButton = document.querySelector('#request-funds');
                requestFundsButton.style.display = 'none';

            } else {

                fundsNeededAccordion.style.backgroundColor = '#F77171';
                fundsNeededAccordion.style.color = 'black';
                
                const fundRequestStatusHolder = document.querySelector('#fund-request-status-holder');
                fundRequestStatusHolder.style.display = 'none';

                const requestFundsButton = document.querySelector('#request-funds');
                requestFundsButton.addEventListener('click', async() => {
                    await fetch(`/cmbettingapi/newfundrequest/${depositRequired-netPosition}`)
                    
                    fundsNeededAccordion.style.backgroundColor = '#FB923C';
                    fundsNeededAccordion.style.color = 'black';

                    const fundsStatus = document.querySelector('#funds-status');
                    fundsStatus.textContent = 'PENDING';
                    fundsStatus.style.border = '1px solid #FB923C';

                    requestFundsButton.style.display = 'none';

                    const timerSVG = document.querySelector('#timer-svg');
                    timerSVG.style.display = 'block';
                    fundsNeededAccordion.appendChild(timerSVG);

                    fundRequestStatusHolder.style.display = 'flex';

                });
            }

        } else {
            const fundsNeededAccordion = document.querySelector('#funds-needed-accordion');
            fundsNeededAccordion.style.backgroundColor = '#49DE80';
            fundsNeededAccordion.style.color = 'black';

            const checkSVG = document.querySelector('#check-svg');
            checkSVG.style.display = 'block';

            fundsNeededAccordion.appendChild(checkSVG);
            const dealWithFunds = document.querySelector("#deal-with-fundrequests");

            dealWithFunds.style.display = 'none';
            showForm = true;
            
            
        
        }   
    } else {
        showForm = true;
    }

    for (let stbookmakerIndex = 0; stbookmakerIndex < stageBookmakerArray.length; stbookmakerIndex++) {

        const stageBookmaker = stageBookmakerArray[stbookmakerIndex];
        const newBookmaker = bookmakerHolderTemplate.cloneNode(true);
        newBookmaker.querySelector('#bookmaker-title').textContent = stageBookmaker.bookmaker;
        const bookmakerLink = newBookmaker.querySelector('#bookmaker-link');
        if (stageBookmaker.link) {
            bookmakerLink.setAttribute('href', stageBookmaker.link);
        } else {
            bookmakerLink.style.display = 'none';
        }

        newBookmaker.querySelector('#deposit-amount').textContent = `£${stageBookmaker.depositAmount} Deposit`
        newBookmaker.style.display = 'flex';
        newBookmaker.style.flexDirection = 'column';

        stageHolder.appendChild(newBookmaker);
    
        if (!(bookmakers.includes(stageBookmaker.bookmaker))) {
            if (showForm) {
                await bookmakerListener(fullName, newBookmaker);
                newBookmaker.querySelector('#wait-for-funds').style.display = 'none';
            } else {
                newBookmaker.querySelector('#wait-for-funds').style.display = 'block';
                newBookmaker.querySelector('#bookmaker-link').style.display = 'none';
                newBookmaker.querySelector('#status-text').style.display = 'none';
                newBookmaker.querySelector('#details-form').style.display = 'none';
                newBookmaker.querySelector('#show-details-button').style.display = 'none';
            }
            await setSkipListner(fullName, newBookmaker);
            
        } else {
            setBookmakerToDone(newBookmaker, true);
        }
    }

    stageHolder.style.display = 'flex';
    stageHolder.style.display = 'column';

    if (!pastStage) {
        await setUpSubMenu(stage, fullName, bookmakers);
    }
    
}

async function loadAccounts(fullName) {

    const stageResponse = await fetch(`/cmbettingapi/getstage`)
    const stageJson = await stageResponse.json();
    let stage = stageJson.stage;

    if (stage === null) {
        stage = 1;
    }
    if (stage !== null) {
        stage = stage*1;
        await dealWithStages(fullName, stage, false);
        return;
    } 

}

async function setUpSubMenu(stage, fullName) {

    const timerSVG = document.querySelector('#svg-timer');

    for (let i = 1; i < stage+1; i++) {

        let subMenuDiv = document.querySelector(`#stage-${i}`);

        if (i <= stage) {
            if (!subMenuDiv.classList.contains('event')) {
                subMenuDiv.addEventListener('click', async function() {
                    if (i < stage) {
                        await dealWithStages(fullName, i, true);
                    } else {
                        await dealWithStages(fullName, i, false);
                    }
                    
                });
            }
        }
        
        subMenuDiv.classList.add('event');

        if (i===stage) {

            subMenuDiv.style.backgroundColor = '#FB923C';
            timerSVG.style.display = 'block';
            subMenuDiv.appendChild(timerSVG);
            
        } else {

            subMenuDiv.style.backgroundColor = '#49DE80';
        }
    }

    
    for (let i = stage+1; i < 5; i++) {
        let subMenuDiv = document.querySelector(`#stage-${i}`);
        subMenuDiv.style.backgroundColor = '#F77171';
    }


}

document.addEventListener("DOMContentLoaded", async function() {
    
    try {        
        await loadAccounts();
    } catch(error) {
        console.error('error with getting the user id', error);
    }

}); 