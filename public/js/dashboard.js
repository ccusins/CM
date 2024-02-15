function enableMenuItems() {

    let disabledItems = document.querySelectorAll('.menu_button.disabled');

    disabledItems.forEach(disabledItem => {
        disabledItem.style.display = 'none';
    });

    let accountMenuButton = document.querySelector('#accounts-menu-button');
    accountMenuButton.style.display = 'flex';
    accountMenuButton.style.flexDirection = 'row';
    // let depositMenuButton = document.querySelector('#deposits-menu');
    // depositMenuButton.style.display = 'block';
}

async function findStatus(userid, fullName, email) {
    
    checkProfit(userid);
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

        const res = await fetch(`/cmbettingapi/getuserinfo/${encodeURIComponent(userid)}`);
        data = await res.json();
                
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

async function checkProfit(userid) {
    const res = await fetch(`/cmbettingapi/getmoneyinfo/${encodeURIComponent(userid)}`)
    const data = await res.json();

    let profitTitle = document.querySelector('#profit-title');
    if (data.data.success) {
        profitTitle.textContent = `£${data.data.profit}`;
    } else {
        profitTitle.textContent = `£0`;
    }

}

function setOMenuListener(userid, fullName, email) {
    
    let overviewMenuButton = document.querySelector('#overview-menu-button');
    let overviewContainer = document.querySelector('#container1');
    let containers = document.querySelectorAll('.container');
    let menuButtons = document.querySelectorAll('.menu_button.enabled');

    overviewMenuButton.addEventListener('click', async function() {

        let subMenu = document.querySelector('#sub-menu');
        subMenu.style.display = 'none';
        overviewMenuButton.style.backgroundColor = '#2e2d2d';
        containers.forEach(container => {
            if (container !== overviewContainer) {
                container.style.display = 'none';
            }
        });

        menuButtons.forEach(menuButton => {
            if (!menuButton.classList.contains('submenu')) {
                if (overviewMenuButton !== menuButton) {
                    menuButton.style.backgroundColor = '#000000';
                }
            }
        });

        overviewContainer.style.display = 'flex';
        overviewContainer.style.flexDirection = 'column';
        await findStatus(userid, fullName, email);
    });
    
}

document.addEventListener('DOMContentLoaded', async function() {

    try {

        let overviewMenuButton = document.querySelector('#overview-menu-button');
        overviewMenuButton.style.backgroundColor = '#3d3c3c';
        const response = await fetch('/cmbettingapi/getkindeuserinfo');
        const userDetails = await response.json();
        const fullName = userDetails.fullname;
        const userid = userDetails.userid;
        const email = userDetails.email;
        document.querySelector('#menu-name').textContent = `${fullName}`;
        setOMenuListener(userid, fullName, email);

        await findStatus(userid, fullName, email);      
        

    } catch(error) {
        console.error('Error fetching user status:', error);
    }

});