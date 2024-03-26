async function loadAffiliate(userid, fullName) {

    const res = await fetch(`/cmbettingapi/affiliatedata/${encodeURIComponent(userid)}/${encodeURIComponent(fullName)}`)
    const data = await res.json()
    if (data.data.success) {
        let codeText = document.querySelector('#affiliate-code');
        codeText.textContent = data.data.code;

        let userTemplate = document.querySelector('#affiliate-template');

        let affiliateContainer = document.querySelector('#affiliate-container');

        document.querySelector('#earnings').textContent = `£${data.data.earnings}`;
        document.querySelector('#sign-ups').textContent = data.data.signups;
        document.querySelector('#future-earnings').textContent = `£${data.data.futureearnings}`;
        
        data.data.userdata.forEach(userInfo => {
            let newUser = userTemplate.cloneNode(true);
            
            newUser.querySelector('#affiliate-name').textContent = userInfo.fullname;
            let accountMadeTitle = newUser.querySelector('#affiliate-accounts-made');
            accountMadeTitle.textContent = userInfo.accounts_made;
            const accountsMade = userInfo.accounts_made * 1
            
            if (accountsMade > 9) {
                accountMadeTitle.style.backgroundColor = '#49DE80';
            } else {
                accountMadeTitle.style.backgroundColor = '#F77171';
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
        

        await loadAffiliate(userid, fullName);

    } catch(error) {
        console.error('error with getting the user id', error);
    }

});