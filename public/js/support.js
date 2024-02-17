async function setCompleteFundListener(completeButton, userid, amount) {
    completeButton.addEventListener('click', async function() {
        await fetch(`/cmbettingapi/completefundrequest/${encodeURIComponent(userid)}/${encodeURIComponent(amount)}`)
        await loadFundRequests(userid);
    });
}

async function loadFundRequests(userid) {

    const res = await fetch(`/cmbettingapi/getfundrequests/${encodeURIComponent(userid)}`)
    const data = await res.json();

    if (data.data.success) {
        let amount = data.data.amount;

        let frContainer = document.querySelector('#fr-container');
        frContainer.style.display = 'flex';
        frContainer.style.flexDirection = 'row';
        
        let amountText = document.querySelector('#fr-text');
        amountText.textContent = `Amount: ${amount}`;

        let completeButton = document.querySelector('#fr-button');
        await setCompleteFundListener(completeButton, userid, amount);
    } else {

        let frContainer = document.querySelector('#fr-container');
        frContainer.style.display = 'flex';
        frContainer.style.flexDirection = 'row';
        
        let amountText = document.querySelector('#fr-text');
        amountText.textContent = `NO ACTIVE FUND REQUESTS`;

        let completeButton = document.querySelector('#fr-button');
        completeButton.style.display = 'none';
    }

}

async function fundFormListener() {
    let fundForm = document.querySelector('#support-funds');

    fundForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let userid = fundForm.querySelector('#support-find-id-funds').value;
        await loadFundRequests(userid);
    });
}

async function loadMoneyInfo(userid) {

    let totalWithdrawals = document.querySelector('#support-total-text')
    let profitText = document.querySelector('#support-profit-text')
    let netBalanceText = document.querySelector('#support-owed-text')

    const res = await fetch(`/cmbettingapi/getmoneyinfo/${encodeURIComponent(userid)}`)
    const data = await res.json();
    profitText.textContent = `£${data.data.profit}`;
    totalWithdrawals.textContent = `£${data.data.withdrawals}`;    
    netBalanceText.textContent = `£${data.data.netposition}`;

}

// function addDepositListener(token, accountsUserId, bookmaker, newAccount) {
    
//     let accountDepositForm = newAccount.querySelector('#support-add-deposit');
//     accountDepositForm.addEventListener('submit', function(e) {
//         e.preventDefault();

//         let bookieAmount = accountDepositForm.querySelector('#support-add-deposit-amount').value;
//         fetch(`https://cmbettingoffers.pythonanywhere.com/newdeposit/${encodeURIComponent(accountsUserId)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(bookieAmount)}`)
//         .then(response => { return response.json() })
//         .then(data => {
//             loadDeposits(token, accountsUserId, bookmaker, newAccount);
//         })
//         .catch(error => {
//             console.error('There has been a problem with your fetch operation:', error);                
//         })
//     });

// }

async function setAccountProgress(userid, bookmaker, newAccount) {

    const res = await fetch(`/cmbettingapi/checkbookmakerprogress/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
    const data = await res.json();
    
    let bookmakerStatusText = newAccount.querySelector('.support_accounts_text.status');
    let bookmakerProgressForm = newAccount.querySelector('#support-account-progress-form');
    
    if (data.data.success) {

        let progressStatus = data.data.status;
        bookmakerStatusText.textContent = progressStatus;
        
        if (progressStatus === 'qb not placed') {
            bookmakerStatusText.style.backgroundColor = '#EE746E';
        } else if (progressStatus === 'qb placed') {
            bookmakerStatusText.style.backgroundColor = '#FF954F';
        } else {
            bookmakerStatusText.style.backgroundColor = '#77DD77';
        }

        
        bookmakerProgressForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            let newProgressStatus = bookmakerProgressForm.querySelector('#support-account-progress-value').value;

            await fetch(`/cmbettingapi/changebookmakerprogress/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(newProgressStatus)}`)

            bookmakerStatusText.textContent = newProgressStatus;
            if (newProgressStatus === 'qb not placed') {
                bookmakerStatusText.style.backgroundColor = '#EE746E';
            } else if (newProgressStatus === 'qb placed') {
                bookmakerStatusText.style.backgroundColor = '#FF954F';
            } else {
                bookmakerStatusText.style.backgroundColor = '#77DD77';
            }
        });

    } else {
        bookmakerStatusText.textContent = "qb not placed";
        bookmakerStatusText.style.backgroundColor = '#EE746E';
    }
}

async function loadWithdrawals(userid, bookmaker, newAccount) {
    
    let depositContainer = newAccount.querySelector('.support_menu_container.deposits');
    depositContainer.style.display = "none";

    let profitContainer = newAccount.querySelector('.support_menu_container.profit');
    profitContainer.style.display = "none";

    let withdrawalContainer = newAccount.querySelector('.support_menu_container.withdrawals');
    withdrawalContainer.innerHTML = '';
    let withdrawalTemplate = newAccount.querySelector('.support_menu_template.withdrawal');

    withdrawalContainer.style.display = "flex";
    withdrawalContainer.style.flexDirection = "column";
    let totalWithdrawals = 0;

    const res = await fetch(`/cmbettingapi/getwithdrawals/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}`)
    const data = await res.json();

    if (data.data.success) {
       
        data.data.withdrawals.forEach(withdrawal => {

            let newWithdrawal = withdrawalTemplate.cloneNode(true);

            let totalText = newWithdrawal.querySelector('.support_menu_text.total')
            totalText.style.display = 'none';

            let amountText = newWithdrawal.querySelector('.support_menu_text.amount')

            amountText.textContent = `£${withdrawal.amount}`;

            totalWithdrawals += parseFloat(withdrawal.amount);
            
            newWithdrawal.style.display = "flex";
            newWithdrawal.style.flexDirection = "row";

            withdrawalContainer.appendChild(newWithdrawal);
        });

        let totalWithdrawalNode = withdrawalTemplate.cloneNode(true);

        let totalText = totalWithdrawalNode.querySelector('.support_menu_text.total');
        totalText.textContent = `Total Withdrawals: £${totalWithdrawals}`
        totalText.style.color = 'black';

        let amountText = totalWithdrawalNode.querySelector('.support_menu_text.amount')
        amountText.style.display = "none";

        totalWithdrawalNode.style.display = "flex";
        totalWithdrawalNode.style.flexDirection = "row";

        totalWithdrawalNode.style.backgroundColor = 'lightgreen';

        withdrawalContainer.appendChild(totalWithdrawalNode);

    }


}

async function setWithdrawalListener(userid, bookmaker, newAccount) {

    let withdrawalForm = newAccount.querySelector('#support-withdrawal-form');

    withdrawalForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        let amount = withdrawalForm.querySelector('#support-withdrawal-amount').value;
        
        if (amount) {
        
            await fetch(`/cmbettingapi/addwithdrawl/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}`)
        
            await loadMoneyInfo(userid);
            await loadWithdrawals(userid, bookmaker, newAccount);
        }
    });


}

async function setProfitListener(userid, bookmaker, newAccount) {

    let profitForm = newAccount.querySelector('#support-profit-form');

    profitForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let amount = profitForm.querySelector('#support-profit-amount').value;
        let ratio = profitForm.querySelector('#support-profit-ratio').value;

        try {
            await fetch(`/cmbettingapi/addbookmakerprofit/${encodeURIComponent(userid)}/${encodeURIComponent(bookmaker)}/${encodeURIComponent(amount)}/${encodeURIComponent(ratio)}`)
        } catch(error) {
            console.log('error with adding profit', error);
        }

        await loadProfit(userid, bookmaker, newAccount);
        await loadMoneyInfo(userid);
    });
}

async function loadProfit(userid, account, newAccount) {

    let withdrawalContainer = newAccount.querySelector('.support_menu_container.withdrawals')
    withdrawalContainer.style.display = 'none';
    
    let depositContainer = newAccount.querySelector('.support_menu_container.deposits');
    depositContainer.style.display = 'none';
    
    let profitContainer = newAccount.querySelector('.support_menu_container.profit');
    profitContainer.innerHTML = '';
    profitContainer.style.display = "flex";
    profitContainer.style.flexDirection = "column";

    let profitTemplate = newAccount.querySelector('.support_menu_template.profit')

    const res = await fetch(`/cmbettingapi/checkbookmakerprofit/${encodeURIComponent(userid)}/${encodeURIComponent(account)}`)
    const data = await res.json();
        
    if (data.data.success) {

        let profitHolder = profitTemplate.cloneNode(true);
        profitHolder.style.display = 'flex';
        profitHolder.style.flexDirection = 'column';

        let profitText = profitHolder.querySelector('h1.support_menu_text.profit_text');
        profitText.textContent = `Account Profit: £${data.data.profit}`;
        
        profitContainer.appendChild(profitHolder);

    }

}

async function setUpAccountListener() {
    
    const findAccountsForm = document.getElementById('support-find-accounts')
    findAccountsForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userid = document.getElementById('support-find-id-accounts').value;
        await loadMoneyInfo(userid);
        const res = await fetch(`/cmbettingapi/getbookmakerdetails/${encodeURIComponent(userid)}`)
        const data = await res.json();

        if (data.data.success) {

            data.data.data.forEach(async(itemData) => {
    
                let bookmakerTemplate = document.querySelector('.support_template_accounts_container');
                let bookmakerContainer = document.querySelector('.support_accounts_container');

                let bookmaker = itemData.bookmaker;
                let bookmakerUsername = itemData.bookmakerUsername;
                let bookmakerEmail = itemData.bookmakerEmail;
                let bookmakerPassword = itemData.bookmakerPassword;

                const newAccount = bookmakerTemplate.cloneNode(true);
                
                await setAccountProgress(userid, bookmaker, newAccount);

                let bookmakerText = newAccount.querySelector('.support_accounts_text.bookmaker');
                bookmakerText.textContent = bookmaker;
                
                let bookmakerEmailText = newAccount.querySelector('.support_accounts_text.bookmaker_email');
                bookmakerEmailText.textContent = bookmakerUsername;

                let bookmakerUsernameText = newAccount.querySelector('.support_accounts_text.bookmaker_username');
                bookmakerUsernameText.textContent = bookmakerEmail;

                let bookmakerPasswordText = newAccount.querySelector('.support_accounts_text.bookmaker_password');
                bookmakerPasswordText.textContent = bookmakerPassword;
                
                newAccount.style.display = "block";
                bookmakerContainer.appendChild(newAccount);
                
                await setProfitListener(userid, bookmaker, newAccount);
                await setWithdrawalListener(userid, bookmaker, newAccount);

                let showDepositsButton = newAccount.querySelector('.support_menu_button.deposits');
                let showWithdrawalsButton = newAccount.querySelector('.support_menu_button.withdrawals');
                let showProfitButton = newAccount.querySelector('.support_menu_button.profit')
                        
                showWithdrawalsButton.addEventListener('click', async function() {
                    
                    showWithdrawalsButton.style.backgroundColor = 'white';
                    showWithdrawalsButton.style.color = '#303030';

                    showDepositsButton.style.backgroundColor = 'transparent';
                    showDepositsButton.style.color = 'white';
                    
                    showProfitButton.style.backgroundColor = 'transparent';
                    showProfitButton.style.color = 'white';

                    await loadWithdrawals(userid, bookmaker, newAccount);
                });
                
                showProfitButton.addEventListener('click', async function() {

                    showProfitButton.style.backgroundColor = 'white'
                    showProfitButton.style.color = '#303030';

                    showWithdrawalsButton.style.backgroundColor = 'transparent';
                    showWithdrawalsButton.style.color = 'white';

                    showDepositsButton.style.backgroundColor = 'transparent';
                    showDepositsButton.style.color = 'white';

                    await loadProfit(userid, bookmaker, newAccount);     
                });
                
            });
            
        }
    });
}

async function getUsers() {
    
    const usersContainer = document.getElementById('support-users-container');
    const usersTemplate = document.getElementById('support-users-template');

    const res = await fetch(`/cmbettingapi/getusers`)
    const data = await res.json();

    if (data.data.success) {

        data.data.data.forEach(async(itemData) => {

        const newUser = usersTemplate.cloneNode(true);
        let notSignedContract = false;
        let notSentBank = false;

        newUser.querySelector('.support.name').textContent = itemData.fullname;
        newUser.querySelector('.support.id').textContent = itemData.userid;
        newUser.querySelector('.support.phone').textContent = itemData.phone;
        newUser.querySelector('.support.email').textContent = itemData.email;

        const statusRes = await fetch(`/cmbettingapi/getuserinfo/${encodeURIComponent(itemData.userid)}`)
        const statusData = await statusRes.json();

        let contract = statusData.data.contract;
        let bank = statusData.data.bank;

        let contractText = newUser.querySelector('.support.contract.status');
        let bankText = newUser.querySelector('.support.bank.status');

        contractText.textContent = contract;
        bankText.textContent = bank;

        if (bank !== 'done') {
            bankText.style.backgroundColor = '#EE746E';
            notSentBank = true;
        } else {
            bankText.style.backgroundColor = '#77DD77';
        }

        if (contract !== 'done') {
            contractText.style.backgroundColor = '#EE746E';
            notSignedContract = true; 
        } else {
            contractText.style.backgroundColor = '#77DD77';
        }

        newUser.style.display = 'block';
    
        usersContainer.appendChild(newUser);
        
        let contractButton = newUser.querySelector('#support-contract-button');
        let bankButton = newUser.querySelector('#support-bank-button');

        if (notSignedContract) {

            contractButton.addEventListener('click', async function() {

                await fetch(`/cmbettingapi/completesetup/${encodeURIComponent(itemData.userid)}/contract`)
                
                contractButton.style.display = "none";
            
            });

        } else {
            contractButton.style.display = "none";
        }

        if (notSentBank) {

            bankButton.addEventListener('click', async function() {
            await fetch(`/cmbettingapi/completesetup/${encodeURIComponent(itemData.userid)}/bank`)
            bankButton.style.display = "none";

        });
        } else {
            bankButton.style.display = "none";
        }             
        
        });
    }
}

document.addEventListener('DOMContentLoaded', async function() { 

    await getUsers(); 
    await setUpAccountListener();
    await fundFormListener();
    
}); 
