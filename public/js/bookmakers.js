async function checkFundsForStage(netBalance, stageHolder, userid) {
    
    let bookmakerHolders = stageHolder.querySelectorAll('.bookmaker_holder');
    let runningDeposit = 0;
    let fundsNeededContainer = stageHolder.querySelector('.nb_container');
    let successContainer = stageHolder.querySelector('#stage1-funds-success')

    bookmakerHolders.forEach(bookmakerHolder => {
        const signUpButton = bookmakerHolder.querySelector('.bookmaker_link');
        let isVisible = false;
        if (signUpButton) {
            const buttonStyle = window.getComputedStyle(signUpButton);
            if (buttonStyle.display !== 'none') {
                isVisible = true;
            }
        } else {
            const enterDetailsButton = bookmakerHolder.querySelector('.show_form');
            const enterDetailsStyle = window.getComputedStyle(enterDetailsButton);
            if (enterDetailsStyle.display === 'none') {
                isVisible = false;
            } else {
                isVisible = true;
            }
        }

        if (isVisible) {
            
            let depositAmountTextHolder = bookmakerHolder.querySelector('.bookmaker_title.deposit');
            let depositAmountText = depositAmountTextHolder.textContent;
            let depositMatch = depositAmountText.match(/\d+/);
            let depositAmount = depositMatch ? parseInt(depositMatch[0], 10) : 0;
            runningDeposit += depositAmount;

        }
        
    });

    if (runningDeposit <= netBalance) {        
        console.log(fundsNeededContainer);
        fundsNeededContainer.style.display = 'none';
        let allBookmakersDone = true;
        bookmakerHolders.forEach(bookmakerHolder => {
            let isDone = bookmakerHolder.classList.contains("done");
            const titles = bookmakerHolder.querySelectorAll('.bookmaker_title');

            if (!isDone) {
                let disabledText = bookmakerHolder.querySelector('.disabled_ag_text');
                disabledText.style.display = 'none'; 
                allBookmakersDone = false;
            }
        });

        successContainer.style.display = 'flex';
        successContainer.style.flexDirection = 'column';

        if (allBookmakersDone) {
            let successContainerText = successContainer.querySelector('.text');
            successContainerText.textContent = 'You have completed all bookmakers for this stage - you will be texted shortly to settle any owed money. Once this is done you will be able to move onto the next stage';
        }

    } else {
        fundsNeededContainer.style.display = 'flex';
        fundsNeededContainer.style.flexDirection = 'column';

        let amountNeeded = runningDeposit - netBalance;
        let amountNeededText = stageHolder.querySelector('#acc-fundsneeded');
        amountNeededText.textContent = ` £${amountNeeded}`;

        bookmakerHolders.forEach(bookmakerHolder => {
            let isDone = bookmakerHolder.classList.contains("done");
            if (!isDone) {

                let disabledText = bookmakerHolder.querySelector('.disabled_ag_text');
                disabledText.style.display = 'block';

                bookmakerHolder.style.border = '1px solid #ed746e';
                let statusText = bookmakerHolder.querySelector('.bookmaker_status_holder');
                statusText.style.display = 'none';

                const texts = bookmakerHolder.querySelectorAll('.text');
                if (texts) {
                    texts.forEach(text => {
                        text.style.display = 'none';
                    });
                }

                let linkButton = bookmakerHolder.querySelector('.bookmaker_link');
                if (linkButton) {
                    linkButton.style.display = 'none';
                }
                

                let detailsButton = bookmakerHolder.querySelector('.show_form');
                detailsButton.style.display = 'none';

                let alreadyGotButton = bookmakerHolder.querySelector('#skip-bookmaker-button');
                alreadyGotButton.style.display = 'block';
            }
        });
        

        await loadFundRequests(userid, stageHolder, amountNeeded);

    }
}

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

async function dealWithStages(fullName, userid, stageHolder, stage) {
    
    const response = await fetch(`/cmbettingapi/getbookmakers/${encodeURIComponent(userid)}`)
    const data = await response.json()

    let isSuccess = data.data.success;
    let bookmakers = ['none'];

    if (isSuccess) {
        bookmakers = data.data.bookmakers;
    }

    let bookmakerHolders = stageHolder.querySelectorAll('.bookmaker_holder');

    await setUpSubMenu(stage, userid, fullName, bookmakers);

    for (let bookmakerIndex = 0; bookmakerIndex < bookmakerHolders.length; bookmakerIndex++) {
        const bookmakerHolder = bookmakerHolders[bookmakerIndex];
        let bookmakerTitle = bookmakerHolder.querySelector('.bookmaker_title').textContent;;
        let found = false;
        found = bookmakers.some(item => item.bookmaker === bookmakerTitle);
        
        
        if (!found) {
            await bookmakerListener(userid, fullName, bookmakerHolder);
            await setSkipListner(userid, fullName, bookmakerHolder);
        } else {
            console.log(bookmakerTitle);
            await setBookmakerToDone(userid, bookmakerHolder, false);
        }

    }

    const moneyRes = await fetch(`/cmbettingapi/getmoneyinfo/${encodeURIComponent(userid)}`)
    const moneyData = await moneyRes.json();
    
    const withdrawals = moneyData.data.withdrawals;
    const profit = moneyData.data.profit;
    const netPosition = moneyData.data.netposition;

    let totalWithdrawals = document.querySelector('#deposits-withdrawal-counter')
    let profitText = document.querySelector('#deposits-profit-counter')
    let netBalanceText = document.querySelector('#deposits-net-counter')

    profitText.textContent = `£${profit}`;
    totalWithdrawals.textContent = `£${withdrawals}`;
    netBalanceText.textContent = `£${netPosition}`;

    let stageperc = (((stage-1)/9)*100).toFixed(0);
    let progressBarFill = document.querySelector('#background-fill');
    progressBarFill.style.width = `${stageperc}%`;

    let progressBarText = document.querySelector('.progressperc');
    progressBarText.textContent = `${stageperc}%`;

    stageHolder.style.display = 'flex';
    stageHolder.style.display = 'column';

    await checkFundsForStage(netPosition, stageHolder, userid);                        

}

async function loadAccounts(fullName, userid) {

    const stageResponse = await fetch(`/cmbettingapi/getstage/${encodeURIComponent(userid)}`)
    const stageJson = await stageResponse.json();
    let stage = stageJson.stage;

    if (stage !== null) {
        stage = stage*1;
        let currentStageHolder = document.querySelector(`#stage-${stage}-container`);
        await dealWithStages(fullName, userid, currentStageHolder, stage);
        return;
    }

    const response = await fetch(`/cmbettingapi/getbookmakers/${encodeURIComponent(userid)}`)
    const data = await response.json()

    let isSuccess = data.data.success;
    let bookmakers = ['none'];

    if (isSuccess) {
        bookmakers = data.data.bookmakers;
    }

    let isCurrentStage = false;
    let i = 1;

    while (!isCurrentStage) {
    
        if (i === 10) {
            isCurrentStage = true;
            break;
        }

        let holderId = `stage-${i}-container`;

        let stageHolder = document.querySelector(`#${holderId}`);
        if (stageHolder) {
            let bookmakerHolders = stageHolder.querySelectorAll('.bookmaker_holder');

                bookmakerHolders.forEach(async(bookmakerHolder) => {

                    let bookmakerTitle = bookmakerHolder.querySelector('.bookmaker_title').textContent;;
                    let found = false;
                    found = bookmakers.some(item => item.bookmaker === bookmakerTitle);
                    
                    if (!found) {
                        isCurrentStage = true;
                        await setUpSubMenu(i, userid, fullName, bookmakers);
                        await bookmakerListener(userid, fullName, bookmakerHolder);
                        await setSkipListner(userid, fullName, bookmakerHolder);
                    } else {
                        await setBookmakerToDone(userid, bookmakerHolder, false);
                    }

                });
                

            if (isCurrentStage) {
                
                const moneyRes = await fetch(`/cmbettingapi/getmoneyinfo/${encodeURIComponent(userid)}`)
                const moneyData = await moneyRes.json()
                
                const withdrawals = moneyData.data.withdrawals;
                const profit = moneyData.data.profit;
                const netPosition = moneyData.data.netposition;

                let totalWithdrawals = document.querySelector('#deposits-withdrawal-counter')
                let profitText = document.querySelector('#deposits-profit-counter')
                let netBalanceText = document.querySelector('#deposits-net-counter')

                profitText.textContent = `£${profit}`;
                totalWithdrawals.textContent = `£${withdrawals}`;
                netBalanceText.textContent = `£${netPosition}`;

                let stageperc = (((i-1)/9)*100).toFixed(0);
                let progressBarFill = document.querySelector('#background-fill');
                progressBarFill.style.width = `${stageperc}%`;

                let progressBarText = document.querySelector('.progressperc');
                progressBarText.textContent = `${stageperc}%`;

                stageHolder.style.display = 'flex';
                stageHolder.style.display = 'column';

                await checkFundsForStage(netPosition, stageHolder, userid);                        

                await fetch(`/cmbettingapi/updatestage/${encodeURIComponent(userid)}/${encodeURIComponent(i)}`)
    
            }
        }
        i++;
    };


}

async function setUpSubMenu(index, userid, fullName, bookmakerArray) {
    
    for (let i = 1; i < index+1; i++) {

        let subMenuDiv = document.querySelector(`#submenu-${i}`);
        let menuText = subMenuDiv.querySelector('.item_title');

        if (!subMenuDiv.classList.contains('event')) {
            subMenuDiv.addEventListener('click', async function() {
                let stageHolder = document.querySelector(`#stage-${i}-container`);
                stageHolder.style.display = 'flex';
                stageHolder.style.flexDirection = 'column';
                let otherContainers = document.querySelectorAll('.acc_container');
                otherContainers.forEach(otherContainer => {
                    if (otherContainer !== stageHolder) {
                        otherContainer.style.display = 'none';
                    }
                });
                if (i !== index) {
                    await goToPastStage(userid, stageHolder, fullName, bookmakerArray);
                }
            });
        }
        subMenuDiv.classList.add('event');

        if (i===index) {
            subMenuDiv.style.backgroundColor = '#f29339';
            menuText.style.color = '#161616';
        
        } else {
            subMenuDiv.style.backgroundColor = '#19ce19';
            menuText.style.color = '#161616';
        }
    }

    
    for (let i = index+1; i < 10; i++) {
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