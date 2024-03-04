async function loadAffiliate(userid, fullName) {

    const res = await fetch(`/cmbettingapi/affiliatedata/${encodeURIComponent(userid)}/${encodeURIComponent(fullName)}`)
    const data = await res.json()
    if (data.data.success) {
        let codeText = document.querySelector('#affiliate-code');
        codeText.textContent = data.data.code;

        let userTemplate = document.querySelector('#affiliate-template');
        userTemplate.style.display = 'none';
        let affiliateContainer = document.querySelector('#affiliate-template-container');

        document.querySelector('#affiliate-fe').textContent = `£${data.data.futureearnings}`;
        document.querySelector('#affiliate-signups').textContent = data.data.signups;
        document.querySelector('#affiliate-earnings').textContent = `£${data.data.earnings}`;
        
        data.data.userdata.forEach(userInfo => {
            let newUser = userTemplate.cloneNode(true);
            
            newUser.querySelector('#affiliate-name').textContent = userInfo.fullname;
            let accountMadeTitle = newUser.querySelector('#affiliate-accounts-made');
            accountMadeTitle.textContent = userInfo.accounts_made;
            const accountsMade = userInfo.accounts_made * 1
            
            if (accountsMade > 9) {
                accountMadeTitle.style.backgroundColor = '#19ce19';
            }

            newUser.style.display = 'flex';
            newUser.style.flexDirection = 'row';

            affiliateContainer.appendChild(newUser);

        });
    } else {
        let codeText = document.querySelector('#affiliate-code');
        codeText.textContent = data.data.code;
    }

}

document.addEventListener("DOMContentLoaded", async function() {

    try {
        
        const response = await fetch('/cmbettingapi/getkindeuserinfo');
        const userDetails = await response.json();

        const fullName = userDetails.fullname;
        const userid = userDetails.userid;
        
        let affiliateMenuButton = document.querySelector('#affiliate-menu-button');
        let menuButtonCounter = 0;
        affiliateMenuButton.addEventListener('click', async function() {

            affiliateMenuButton.style.backgroundColor = '#2e2d2d';
            let menuButtons = document.querySelectorAll('.menu_button.enabled');
            menuButtons.forEach(menuButton => {
                if (menuButton !== affiliateMenuButton) {
                    menuButton.style.backgroundColor = '#000000';
                }
            });

            let subMenu = document.querySelector('.sub_menu');
            let subMenuStyle = window.getComputedStyle(subMenu);
            if (subMenuStyle.display !== 'none') {
                subMenu.style.display = 'none';
            }
            
            let affiliateContainer = document.querySelector('.container.affiliate');
            affiliateContainer.style.display = 'flex';
            affiliateContainer.style.flexDirection = 'column';

            let containers = document.querySelectorAll('.container');
            containers.forEach(container => {
                if (container !== affiliateContainer) {
                    container.style.display = 'none';
                }
            });
            
            if (menuButtonCounter === 0) {
                await loadAffiliate(userid, fullName);
                menuButtonCounter ++;
            }
        });

    } catch(error) {
        console.error('error with getting the user id', error);
    }

});