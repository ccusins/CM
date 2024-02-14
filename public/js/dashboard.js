function enableMenuItems() {

    let disabledItems = document.querySelectorAll('.menu_button.disabled');

    disabledItems.forEach(disabledItem => {
        disabledItem.style.display = 'none';
    });

    let accountMenuButton = document.querySelector('#account-menu');
    accountMenuButton.style.display = 'block';
    // let depositMenuButton = document.querySelector('#deposits-menu');
    // depositMenuButton.style.display = 'block';
}

async function findStatus(userid, fullName, email) {
    
    let setUpForm = document.querySelector('#contact-form');
    let contactInfo = document.querySelector('#contact-info');
    contactInfo.style.display = 'none';
    let bcInfo = document.querySelector('#bc-info');
    bcInfo.style.display = 'none';
    let setUpBlocks = document.querySelector('#set-ups');
    let contractBlock = document.querySelector('#set-up-contract');
    let contractStatus = contractBlock.querySelector('#status-contract');
    let bankBlock = document.querySelector('#set-up-bank');
    let bankStatus = bankBlock.querySelector('#status-bank');
    let setUpTitle = document.querySelector('#setup-title');
    let setUpContainer = document.querySelector('#setup-container');

    try {
        let data;
        try {
            const res = await fetch(`/cmbettingapi/getuserinfo/${encodeURIComponent(userid)}`);
            data = await res.json();
            console.log(data);
        } catch(error) {
            console.error('problem with getting user status', error);
        }
        
        
        if (data.data.success) {
            const contract = data.data.contract;
            const bank = data.data.bank;

            setUpForm.style.display = 'none';
            contactInfo.style.display = 'none';
            
            setUpBlocks.style.display = 'flex';
            setUpBlocks.style.flexDirection = 'row';

            if (contract === 'done' && bank === 'done') {
                setUpContainer.style.display = 'none';
                enableMenuItems();

            } else {
                
                bcInfo.style.display = 'flex';
                bcInfo.style.flexDirection = 'column';

                setUpContainer.style.display = 'flex';
                setUpContainer.style.flexDirection = 'column';

                setUpTitle.textContent = 'Sign Contract and Provide Bank Details';
                if (contract === 'done') {
                    contractBlock.style.backgroundColor = '#77DD77';
                    contractStatus.textContent = 'RECEIVED';

                } 
                if (bank === 'done') {
                    bankBlock.style.backgroundColor = '#77DD77';
                    bankStatus.textContent = 'RECEIVED';
                } 
            }
        } else {

            setUpContainer.style.display = 'flex';
            setUpContainer.style.flexDirection = 'column';

            setUpForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                           
                let formSubmitButton = setUpForm.querySelector('.form_submit_button'); 
                formSubmitButton.style.display = 'none';

                let pendingDiv = setUpForm.querySelector('.form_pending'); 
                pendingDiv.style.display = 'block';
                
                let phone = setUpForm.querySelector('#phone-set-up').value; 
                try {
                    const form_res = await fetch(`/cmbettingapi/addcontactdetails/${encodeURIComponent(fullName)}/${encodeURIComponent(userid)}/${encodeURIComponent(phone)}/${encodeURIComponent(email)}`)
                    const form_data = await form_res.json()

                    if (form_data.data.success) {
                        await findStatus(userid, fullName, email)
                    }
                } catch(error) {
                    console.error('problem with adding contact details', error)
                }
                });

        }

    } catch(error) {
        console.error('problem with the get userinfo fetch', error);
    }

}

document.addEventListener('DOMContentLoaded', async function() {

    try {
        const response = await fetch('/cmbettingapi/getkindeuserinfo');
        const userDetails = await response.json();
        const fullName = userDetails.fullname;
        const userid = userDetails.userid;
        const email = userDetails.email;

        document.getElementById('menu-fullname').textContent = `${fullName}`
        
        await findStatus(userid, fullName, email);


    } catch(error) {
        console.error('Error fetching user status:', error);
    }

});