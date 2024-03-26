async function enableMenu() {
    const enabledMenu = document.querySelector('#nav-menu');
    const disabledMenu = document.querySelector('#disabled-nav-menu');

    disabledMenu.style.display = 'none';
    enabledMenu.style.display = 'flex';
}

async function setSetupView(contractStatus, bankStatus) {
    
    await enableMenu();
    const contractView = document.querySelector(`#contract-${contractStatus}`);
    contractView.style.display = 'block';

    const bankView = document.querySelector(`#bank-${bankStatus}`);
    bankView.style.display = 'block';

    if (!(contractStatus === 'done' && bankStatus === 'done')) {
        const pendingText = document.querySelector('#pending-text');
        pendingText.style.display = 'block';
    }

}

async function findStatus(userid, fullName, email) {
    
    await checkProfit(userid);
    const phoneForm = document.querySelector('#phone-form')
    const phoneDesc = document.querySelector('#phone-desc');

    try {
        const res = await fetch(`/cmbettingapi/getuserinfo`)
        data = await res.json();
        if (!data.data.success) {
            console.log(data.data);
            phoneForm.addEventListener('submit', async(e) => {
                e.preventDefault();

                const phone = phoneForm.querySelector('#phone-number').value;
                phoneForm.style.display = 'none';
                await fetch(`/cmbettingapi/addcontactdetails/${encodeURIComponent(fullName)}/${encodeURIComponent(phone)}/${encodeURIComponent(email)}`)
                
                phoneDesc.style.display = 'none';
                await setSetupView('pending', 'pending');

            });
        } else {
            phoneDesc.style.display = 'none';
            phoneForm.style.display = 'none';
            setSetupView(data.data.contract, data.data.bank);
        }

    } catch(error) {
        console.error('problem with the get userinfo fetch', error);
    }

}

async function checkProfit(userid) {
    const res = await fetch(`/cmbettingapi/getmoneyinfo`)
    const data = await res.json();
    let profitTitle = document.querySelector('#profit');
    if (data.data.success) {
        profitTitle.textContent = `£${data.data.profit}`;
    } else {
        profitTitle.textContent = `£0`;
    }

}

async function findAffiliate(userid, fullName) {

    const res = await fetch(`/cmbettingapi/hasappiledaffiliate`)
    const data = await res.json();

    if (data.data.success) {

        let affiliateForm = document.querySelector('#affiliate-form');
        affiliateForm.style.display = 'none';

        let affiliateDesc = document.querySelector('#affiliate-desc');
        affiliateDesc.style.display = 'none';

        let affiliateHeader = document.querySelector('#affiliate-header');
        affiliateHeader.textContent = 'Affiliate Code Applied';

        let applyAffiliateContainer = document.querySelector('#affiliate-container');
        applyAffiliateContainer.style.border = '1px solid #19ce19';

    } else {
        await affiliateFormListener(userid, fullName);
    }
}

async function affiliateFormListener(userid, fullName) {

    let affiliateError = document.querySelector('#affiliate-error');
    let affiliateForm = document.querySelector('#affiliate-form');

    affiliateForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        affiliateError.style.display = 'none';

        let code = affiliateForm.querySelector('#code').value;

        const res = await fetch(`/cmbettingapi/addaffiliate/${encodeURIComponent(code)}/${fullName}`)
        const data = await res.json()

        if (data.data.success) {
            await findAffiliate(userid, fullName);
        } else {
            affiliateError.style.display = 'block';
        }

    });
}

document.addEventListener('DOMContentLoaded', async function() {

    try {

        const response = await fetch('/cmbettingapi/getkindeuserinfo');
        const userDetails = await response.json();
        const fullName = userDetails.fullname;
        const userid = userDetails.userid;
        const email = userDetails.email;
        
        await findAffiliate(userid, fullName);
        await findStatus(userid, fullName, email);     
        
        

    } catch(error) {
        console.error('Error fetching user status:', error);
    }

});