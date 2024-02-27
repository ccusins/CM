async function addNewFormListener(userid, bookmakerHolder, bookmaker, bookmakerDetails) {

    let found = false;
    const formPresence = bookmakerHolder.querySelector('.bookmaker_form');
    if (formPresence) {
        return;
    }

    const titleCount = bookmakerHolder.querySelectorAll('.bookmaker_title'); 
    if (titleCount.length !== 1) {
        return;
    }

    bookmakerDetails.forEach(bookmakerDetail => {

        if (bookmakerDetail.bookmaker === bookmaker) {

            const email = bookmakerDetail.bookmakerEmail;
            if (email === 'NA') {
                return;
            }
            const username = bookmakerDetail.bookmakerUsername;
            const password = bookmakerDetail.bookmakerPassword;

            const bookmakerEmail = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);
            const bookmakerUsername = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);
            const bookmakerPassword = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);

            bookmakerEmail.textContent = email;
            bookmakerUsername.textContent = username;
            bookmakerPassword.textContent = password;      

            bookmakerHolder.appendChild(bookmakerEmail);
            bookmakerHolder.appendChild(bookmakerUsername);
            bookmakerHolder.appendChild(bookmakerPassword);
            
            const fetchButton = bookmakerHolder.querySelector('.button-6');
            const addButton = fetchButton.cloneNode(true);
            fetchButton.parentNode.replaceChild(addButton, fetchButton);
            
            addButton.textContent = 'Add Bookmaker';
            addButton.style.display = 'block';

            addButton.addEventListener('click', async function() {
                await fetch(`/cmbettingapi/addbookmaker/NA/${bookmaker}/${username}/${email}/${password}/${userid}`)
                await fetch(`/cmbettingapi/confirmbetting/${userid}/${bookmaker}`)
                setHolderToDoneWDetails(bookmakerHolder);
            });

            found = true;
            return;
        }
    });

    if (found) {
        return;
    }

    let bookmakerForm = document.querySelector('.bookmaker_form').cloneNode(true);
                
    bookmakerForm.style.display = 'flex';
    bookmakerForm.style.flexDirection = 'column';
    bookmakerHolder.appendChild(bookmakerForm);

    bookmakerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = bookmakerForm.querySelector('.text_field.username').value;
        const accountSetting = bookmakerForm.querySelector('.text_field.account_setting').value;
        const email = bookmakerForm.querySelector('.text_field.email').value;
        
        bookmakerForm.style.display = 'none';
        await fetch(`/cmbettingapi/addbookmaker/NA/${bookmaker}/${username}/${email}/${accountSetting}/${userid}`)
        await fetch(`/cmbettingapi/confirmbetting/${userid}/${bookmaker}`)

        const bookmakerEmail = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);
        const bookmakerUsername = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);
        const bookmakerPassword = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);

        bookmakerEmail.textContent = email;
        bookmakerUsername.textContent = username;
        bookmakerPassword.textContent = accountSetting;      

        bookmakerHolder.appendChild(bookmakerEmail);
        bookmakerHolder.appendChild(bookmakerUsername);
        bookmakerHolder.appendChild(bookmakerPassword);

        setHolderToDoneWDetails(bookmakerHolder);
    });
}

function setHolderToDoneWDetails(bookmakerHolder) {
    
    bookmakerHolder.style.border = '1px solid #17CE1A';
    const addButton = bookmakerHolder.querySelector('.button-6');
    addButton.style.display = 'none';
}

function setHolderToDone(bookmaker, bookmakerHolder, bookmakerDetails) {
    
    const titleCount = bookmakerHolder.querySelectorAll('.bookmaker_title');
    if (titleCount.length !== 1) {
        return;
    }
    bookmakerHolder.style.border = '1px solid #17CE1A';

    bookmakerDetails.forEach(bookmakerDetail => {
        const isBookmaker = bookmakerDetail.bookmaker;
        if (isBookmaker === bookmaker) {
            console.log(bookmaker);

            const email = bookmakerDetail.bookmakerEmail;
            const username = bookmakerDetail.bookmakerUsername;
            const password = bookmakerDetail.bookmakerPassword;

            const bookmakerEmail = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);
            const bookmakerUsername = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);
            const bookmakerPassword = bookmakerHolder.querySelector('.bookmaker_title').cloneNode(true);

            bookmakerEmail.textContent = email;
            bookmakerUsername.textContent = username;
            bookmakerPassword.textContent = password;

            bookmakerHolder.appendChild(bookmakerEmail);
            bookmakerHolder.appendChild(bookmakerUsername);
            bookmakerHolder.appendChild(bookmakerPassword);

        }
    });

    bookmakerHolder.classList.add('done');

}

async function getBookmakerDetails(userid) {

    const res = await fetch(`/cmbettingapi/getbookmakerdetails/${userid}`)
    const data = await res.json();
    const detailsArray = data.data.data;

    return detailsArray;

}

async function setBookmakerDisplay(userid, bookmakerDetails) {

    const getBookmakersRes = await fetch(`/cmbettingapi/getbettingbookmakers/${userid}`)
    const getBookmakerData = await getBookmakersRes.json()
    
    let bookmakers = getBookmakerData.data.bookmakers;
    console.log(bookmakers);

    const bookmakerRows = document.querySelectorAll('.bettingbookmakerrow')
    bookmakerRows.forEach(bookmakerRow => {
        const bookmakerHolders = bookmakerRow.querySelectorAll('.bookmaker_holder')
        bookmakerHolders.forEach(async(bookmakerHolder) => {
            
            let bookmaker = bookmakerHolder.querySelector('.bookmaker_title').textContent;
            if (bookmakers.includes(bookmaker)) {
                setHolderToDone(bookmaker, bookmakerHolder, bookmakerDetails);
            } else {    
                addNewFormListener(userid, bookmakerHolder, bookmaker, bookmakerDetails);
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
                await fetch(`/cmbettingapi/requestperms/${encodeURIComponent(userid)}`)
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

        const detailsArray = await getBookmakerDetails(userid);
        await setBookmakerDisplay(userid, detailsArray);
    }
}

document.addEventListener("DOMContentLoaded", async function() {

    let bettingMenuButton = document.querySelector('.menu_button.enabled.betting');
    let bettingContainer = document.querySelector('.container.betting');
    
    const response = await fetch('/cmbettingapi/getkindeuserinfo');
    const userDetails = await response.json();
    const userid = userDetails.userid;

    const fetchButtons = document.querySelectorAll('.button-6');
    fetchButtons.forEach(fetchButton => {
        fetchButton.style.display = 'none';
    });

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