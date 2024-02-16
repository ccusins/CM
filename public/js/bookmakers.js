async function checkFundsForStage(netBalance, stageHolder, userid) {
    
    let bookmakerHolders = stageHolder.querySelectorAll('.bookmaker_holder');
    let runningDeposit = 0;
    let fundsNeededContainer = stageHolder.querySelector('.nb_container');
    let successContainer = stageHolder.querySelector('#stage1-funds-success')

    bookmakerHolders.forEach(bookmakerHolder => {

        let depositAmountTextHolder = bookmakerHolder.querySelector('.bookmaker_title.deposit');

        const computedStyle = window.getComputedStyle(depositAmountTextHolder);
        const isVisible = computedStyle.display !== 'none';

        if (isVisible) {

            let depositAmountText = depositAmountTextHolder.textContent;
            
            let depositMatch = depositAmountText.match(/\d+/);

            let depositAmount = depositMatch ? parseInt(depositMatch[0], 10) : 0;
            runningDeposit += depositAmount;
        }

    });
    
    if (runningDeposit <= netBalance) {        
        
        successContainer.style.display = 'flex';
        successContainer.style.flexDirection = 'column';

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

                bookmakerHolder.style.backgroundColor = '#EE746E';
                let statusText = bookmakerHolder.querySelector('.bookmaker_status_holder');
                statusText.style.display = 'none';

                let linkButton = bookmakerHolder.querySelector('.bookmaker_link');
                linkButton.style.display = 'none';

                let detailsButton = bookmakerHolder.querySelector('.show_form');
                detailsButton.style.display = 'none';

                let bookmakerTitle = bookmakerHolder.querySelector('.bookmaker_title');
                bookmakerTitle.style.color = '#303030';

                let depositTitle = bookmakerHolder.querySelector('.bookmaker_title.deposit');
                depositTitle.style.color = '#303030';

                let alreadyGotButton = bookmakerHolder.querySelector('#skip-bookmaker-button');
                alreadyGotButton.style.border = "1px solid #303030";
                alreadyGotButton.style.color = '#303030';
            }
        });
        

        await loadFundRequests(userid, stageHolder, amountNeeded);

    }
}

async function loadFundRequests(userid, stageHolder, amount) {

    let nbContainer = stageHolder.querySelector('.nb_container');
    let texts = nbContainer.querySelectorAll('.text.nb')
    let fundsRequestButton = stageHolder.querySelector('.nb_button');

    const res = await fetch(`/cmbettingapi/getfundrequests/${encodeURIComponent(userid)}`)
    const data = await res.json()
    
    if (data.data.success) {
    
            texts[0].style.display = 'none';
            texts[1].textContent = 'Funds were requested successfully - please wait for them to be provided to continue.';
            texts[1].style.fontWeight = "bold";
            texts[1].style.color = "#303030";
            texts[2].style.display = 'none';
            fundsRequestButton.style.display = 'none';
            nbContainer.style.backgroundColor = '#FF954F';
            nbContainer.style.border = 'none';
            
    } else {
        await setFundRequestListner(userid, stageHolder, amount);
    }
}

async function setFundRequestListner(userid, stageHolder, amount) {
    let fundRequestButton = stageHolder.querySelector('.nb_button');

    fundRequestButton.addEventListener('click', async function() {
        
        fundRequestButton.style.display = 'none';
        await fetch(`/cmbettingapi/newfundrequest/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)

        loadFundRequests(userid, stageHolder);

    });
    
}

async function bookmakerListener(userid, fullName, bookmakerHolder) {
    
    let showFormButton = bookmakerHolder.querySelector('.show_form');
    let addDetailsForm = bookmakerHolder.querySelector('.bookmaker_form');

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
    addDetailsForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        console.log('form submitted');
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
        setBookmakerToDone(bookmakerHolder);


    });
}

async function setSkipListner(userid, fullName, bookmakerHolder) {
    let skipButton = bookmakerHolder.querySelector('#skip-bookmaker-button');

    skipButton.addEventListener('click', async function() {
        skipButton.style.display = 'none';
        let bookmaker = bookmakerHolder.querySelector('.bookmaker_title').textContent;
        await fetch(`/cmbettingapi/skipbookmaker/${encodeURIComponent(fullName)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(userid)}`)
        setBookmakerToDone(bookmakerHolder);
    });
}

function setBookmakerToDone(bookmakerHolder) {

    let link = bookmakerHolder.querySelector('.bookmaker_link');
    let showFormButton = bookmakerHolder.querySelector('.show_form');

    if (link) {
        link.style.display = 'none';
    }

    showFormButton.style.display = 'none';

    let statusHolder = bookmakerHolder.querySelector('.bookmaker_status_holder');
    let statusText = bookmakerHolder.querySelector('.bookmaker_status_title');

    let depositText = bookmakerHolder.querySelector('.bookmaker_title.deposit');
    depositText.style.display = 'none';

    let skipButton = bookmakerHolder.querySelector('#skip-bookmaker-button');
    skipButton.style.display = 'none';

    statusText.textContent = 'DONE';    
    statusHolder.style.backgroundColor = '#77DD77';
    
    bookmakerHolder.classList.add("done");
    
}

async function loadAccounts(fullName, userid) {

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

            bookmakerHolders.forEach(async (bookmakerHolder) => {

                let bookmakerTitle = bookmakerHolder.querySelector('.bookmaker_title').textContent;;
                let found = false;
                found = bookmakers.some(item => item.bookmaker === bookmakerTitle);
                
                if (!found) {
                    isCurrentStage = true;
                    await setUpSubMenu(i);
                    await bookmakerListener(userid, fullName, bookmakerHolder);
                    await setSkipListner(userid, fullName, bookmakerHolder);
                } else {
                    setBookmakerToDone(bookmakerHolder);
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
    
            }
        }
        i++;
    };


}

async function setUpSubMenu(index) {
    
    for (let i = 1; i < index+1; i++) {
        let subMenuDiv = document.querySelector(`#submenu-${i}`);
        let menuText = subMenuDiv.querySelector('.item_title');

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

    try {
        const response = await fetch('/cmbettingapi/getkindeuserinfo');
        const userDetails = await response.json();

        const fullName = userDetails.fullname;
        const userid = userDetails.userid;


        let accountMenuButton = document.querySelector('#accounts-menu-button');
        let accountMenuButtonCount = 0;
        
        accountMenuButton.addEventListener('click', async function() {

            let subMenu = document.querySelector('#sub-menu');
            subMenu.style.display = 'flex';
            subMenu.style.display = 'column';

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
                
            await loadAccounts(fullName, userid);

        });

    } catch(error) {
        console.error('error with getting the user id', error);
    }

}); 