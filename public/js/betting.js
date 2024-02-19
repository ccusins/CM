async function addNewFormListener(userid, bookmakerForm, bookmaker) {
    
    if (!bookmakerForm.hasEventListener)
    bookmakerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        let username = bookmakerForm.querySelector('.text_field.username').value;
        let accountSetting = bookmakerForm.querySelector('.text_field.account_setting').value;
        let email = bookmakerForm.querySelector('.text_field.email').value;
        
        bookmakerForm.style.display = 'none';
        await fetch(`/cmbettingapi/addbookmaker/NA/${bookmaker}/${username}/${email}/${accountSetting}/${userid}`)
        await fetch(`/cmbettingapi/confirmbetting/${userid}/${bookmaker}`)
        await setBookmakerDisplay(userid);
    });
}

function setFetchListener(userid, bookmaker, bookmakerHolder) {
    let fetchDetailsButton = bookmakerHolder.querySelector('.button-6');

    if (!fetchDetailsButton.hasEventListener) {
        fetchDetailsButton.addEventListener('click', async function() {
            
            const res = await fetch(`/cmbettingapi/fetchdetails/${userid}/${bookmaker}`)
            const data = await res.json();

            if (data.success) {
                const email = data.email;
                const username = data.username;
                const password = data.password;
                
                let existingEmailTitle = bookmakerHolder.querySelectorAll('.bookmaker_title');
                if (existingEmailTitle.length === 1) {
                    let emailTitle = document.querySelector('.bookmaker_title').cloneNode(true);
                    emailTitle.textContent = email;
                    bookmakerHolder.appendChild(emailTitle);

                    let usernameTitle = document.querySelector('.bookmaker_title').cloneNode(true);
                    usernameTitle.textContent = username;
                    bookmakerHolder.appendChild(usernameTitle);

                    let passwordTitle = document.querySelector('.bookmaker_title').cloneNode(true);
                    passwordTitle.textContent = password;
                    bookmakerHolder.appendChild(passwordTitle);
                }
                
                
                if (!bookmakerHolder.classList.contains('done')) {
                    let addDetailsButton = fetchDetailsButton.cloneNode(true);
                    fetchDetailsButton.style.display = 'none';
                    bookmakerHolder.appendChild(addDetailsButton);
                    addDetailsButton.textContent = 'Add';

                    addDetailsButton.addEventListener('click', async function() {
                        await fetch(`/cmbettingapi/confirmbetting/${userid}/${bookmaker}`)
                        setHolderToDone(userid, bookmaker, bookmakerHolder);
                        setBookmakerDisplay(userid);
                    });
                }


            } else {

                let informationTitle = document.querySelector('.bookmaker_title').cloneNode(true);
                informationTitle.textContent = 'Details not found - please enter below';
                bookmakerHolder.appendChild(informationTitle);

                let bookmakerForm = document.querySelector('.bookmaker_form').cloneNode(true);
                
                bookmakerForm.style.display = 'flex';
                bookmakerForm.style.flexDirection = 'column';
                bookmakerHolder.appendChild(bookmakerForm);

                await addNewFormListener(userid, bookmakerForm, bookmaker);
            }
        });
    }
}

function setHolderToDone(userid, bookmaker, bookmakerHolder) {
    bookmakerHolder.style.border = '1px solid #17CE1A'

    let fetchDetailsButton = bookmakerHolder.querySelector('.button-6');
    fetchDetailsButton.style.color = '#17CE1A';
    fetchDetailsButton.style.border = '1px solid #17CE1A';
    bookmakerHolder.classList.add('done');
    setFetchListener(userid, bookmaker, bookmakerHolder);

}

async function setBookmakerDisplay(userid) {

    const getBookmakersRes = await fetch(`/cmbettingapi/getbettingbookmakers/${userid}`)
    const getBookmakerData = await getBookmakersRes.json()
    
    let bookmakers = getBookmakerData.data.bookmakers;

    const bookmakerRows = document.querySelectorAll('.bettingbookmakerrow')
    bookmakerRows.forEach(bookmakerRow => {
        const bookmakerHolders = bookmakerRow.querySelectorAll('.bookmaker_holder')
        bookmakerHolders.forEach(bookmakerHolder => {
            
            let bookmaker = bookmakerHolder.querySelector('.bookmaker_title').textContent;
            if (bookmakers.includes(bookmaker)) {
                setHolderToDone(userid, bookmaker, bookmakerHolder);
            } else {    
                setFetchListener(userid, bookmaker, bookmakerHolder);
            }   
            }); 
    });
}

async function isDisplayErrorDiv(userid) {
    const res = await fetch(`/cmbettingapi/getperms/${userid}`)
    const data = await res.json();
    let errorDiv = document.querySelector('#errordiv');
    let bookmakersContainer = document.querySelector('#betting-bookmakers-container');
    const requestButton = document.querySelector('#request-perms-button');

    if (!data.perm) {
        errorDiv.style.display = 'flex';
        errorDiv.style.flexDirection = 'column';
        bookmakersContainer.style.display = 'none';
        
        if (!requestButton.hasEventListener) {
            requestButton.addEventListener('click', async function() {
                const response = await fetch(`/cmbettingapi/requestperms/${encodeURIComponent(userid)}`)
                await isDisplayErrorDiv(userid);
            });
        }

    } else if (data.perm === 'requested') {
        errorDiv.style.display = 'flex';
        errorDiv.style.flexDirection = 'column';
        let errorMessage = document.querySelector('#betting-error-status');
        errorMessage.textContent = 'Permissions Requested Successfully - you will be notified shortly with our desicion.';
        bookmakersContainer.style.display = 'none';
        requestButton.style.display = 'none';
        errorDiv.style.border = '1px solid #F29239'
    } else {
        errorDiv.style.display = 'none';
        bookmakersContainer.style.display = 'flex';
        bookmakersContainer.style.flexDirection = 'column ';
        await setBookmakerDisplay(userid);
    }
}

document.addEventListener("DOMContentLoaded", async function() {

    let bettingMenuButton = document.querySelector('.menu_button.enabled.betting');
    let bettingContainer = document.querySelector('.container.betting');
    
    const response = await fetch('/cmbettingapi/getkindeuserinfo');
    const userDetails = await response.json();
    const userid = userDetails.userid;

    
    bettingMenuButton.addEventListener('click', async function() {
        bettingMenuButton.style.backgroundColor = '#2e2d2d';
        let menuButtons = document.querySelectorAll('.menu_button.enabled')
        menuButtons.forEach(menuButton => {
            if (menuButton !== bettingMenuButton) {
                menuButton.style.backgroundColor = '#000000'
            }
        });

        bettingContainer.style.display = 'flex';
        bettingContainer.style.flexDirection = 'column';

        let containers = document.querySelectorAll('.container')
        containers.forEach(container => {
            if (container !== bettingContainer) {
                container.style.display = 'none';
            }
        });

        await isDisplayErrorDiv(userid);
    });

});