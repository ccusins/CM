async function setBookmakerToPending(bookmakerHolder, email, username, password, bookmakerName) {

    const bookmakerForm = bookmakerHolder.querySelector('#details-form');
    bookmakerForm.style.display = 'none';
    
    const showDetailsButton = bookmakerHolder.querySelector('#show-details-button');

    const detailsDiv = bookmakerHolder.querySelector('#details-div');

    detailsDiv.querySelector('#details-email').textContent = email;
    detailsDiv.querySelector('#details-username').textContent = username;
    detailsDiv.querySelector('#details-password').textContent = password;
    
    showDetailsButton.addEventListener('click', function() {
        const computedStyle = window.getComputedStyle(detailsDiv);
        if (computedStyle.display === 'none') {
            detailsDiv.style.display = 'flex'
        } else {
            detailsDiv.style.display = 'none'
        }
    });

    const statusText = bookmakerHolder.querySelector('#status-text');
    statusText.textContent = 'Pending';
    statusText.style.border = '1px solid #FB923C';

    const activateButton = bookmakerHolder.querySelector('#activate-button');
    activateButton.style.display = 'flex';

    activateButton.addEventListener('click', async() => {
        await fetch(`/cmbettingapi/confirmbetting/${bookmakerName}`)
        await setBookmakerToDone(bookmakerHolder, email, username, password);
    });
}

async function setBookmakerToDone(bookmakerHolder, email, username, password) {

    const bookmakerForm = bookmakerHolder.querySelector('#details-form');
    bookmakerForm.style.display = 'none';

    const showDetailsButton = bookmakerHolder.querySelector('#show-details-button');
    showDetailsButton.style.display = 'block';
    const showDetailsCopy = showDetailsButton.cloneNode(true);

    showDetailsButton.parentNode.replaceChild(showDetailsCopy, showDetailsButton);

    
    const detailsDiv = bookmakerHolder.querySelector('#details-div');

    detailsDiv.querySelector('#details-email').textContent = email;
    detailsDiv.querySelector('#details-username').textContent = username;
    detailsDiv.querySelector('#details-password').textContent = password;


    showDetailsCopy.addEventListener('click', function() {
        const computedStyle = window.getComputedStyle(detailsDiv);
        if (computedStyle.display === 'none') {
            detailsDiv.style.display = 'flex'
        } else {
            detailsDiv.style.display = 'none'
        }
    });


    const statusText = bookmakerHolder.querySelector('#status-text');
    statusText.textContent = 'Done';
    statusText.style.border = '1px solid #49DE80';
    
    const activateButton = bookmakerHolder.querySelector('#activate-button');
    activateButton.style.display = 'none';
}   

async function setUnfinishedBookmaker(newBookmaker, bookmakerName) {

    const bookmakerContainers = document.querySelector('#cards-container');
    newBookmaker.querySelector('#bookmaker-title').textContent = bookmakerName;
    const showDetailsButton = newBookmaker.querySelector('#show-details-button');
    const bookmakerForm = newBookmaker.querySelector('#details-form');

    showDetailsButton.style.display = 'none';
    bookmakerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = bookmakerForm.querySelector('#username').value;
        const email = bookmakerForm.querySelector('#email').value;
        const password = bookmakerForm.querySelector('#password').value;

        await fetch(`/cmbettingapi/confirmbetting/${bookmakerName}`);
        await fetch(`/cmbettingapi/addbookmaker/NA/${bookmakerName}/${username}/${email}/${password}`)

        await setBookmakerToDone(newBookmaker, email, username, password);
    });
    
    newBookmaker.style.display = 'flex';
    bookmakerContainers.appendChild(newBookmaker);

}

async function setUpBookmakers() {

    const templateBookmakers = ['Bet365', 'Coral', 'WilliamHill', 'Skybet', 'Ladbrokes', '888sport', 'BetVictor']

    const dbBookmakers = await fetch(`/cmbettingapi/getbookmakerdetails`);
    const dbBookmakersJson = await dbBookmakers.json();
    const dbBookmakerArray = dbBookmakersJson.data.data;
    const bookmakerTemplate = document.querySelector('#bookmaker-template');
    const bookmakerContainer = document.querySelector('#cards-container')
    let doneBookmakers = [];

    dbBookmakerArray.forEach(async (dbBookmaker) => {

        if (!templateBookmakers.includes(dbBookmaker.bookmaker)) {
            return;
        } else {
            doneBookmakers.push(dbBookmaker.bookmaker);
        }

        const newBookmaker = bookmakerTemplate.cloneNode(true);
        
        newBookmaker.querySelector('#bookmaker-title').textContent = dbBookmaker.bookmaker;
        newBookmaker.querySelector('#bookmaker-profit').textContent = `Profit: £${dbBookmaker.profit}`

        if (dbBookmaker.exists === 0) {
            await setBookmakerToPending(newBookmaker, dbBookmaker.bookmakerEmail, dbBookmaker.bookmakerUsername, dbBookmaker.bookmakerPassword, dbBookmaker.bookmaker);
        } else {
            await setBookmakerToDone(newBookmaker, dbBookmaker.bookmakerEmail, dbBookmaker.bookmakerUsername, dbBookmaker.bookmakerPassword);
        }

        newBookmaker.style.display = 'flex';
        bookmakerContainer.appendChild(newBookmaker);
    });

    templateBookmakers.forEach(async(templateBookmaker) =>  {
        
        if (doneBookmakers.includes(templateBookmaker)) {
            return;
        }
        const newBookmaker = bookmakerTemplate.cloneNode(true);
        await setUnfinishedBookmaker(newBookmaker, templateBookmaker);
    });
}

async function setUpMoney() {
    const depositRes = await fetch(`/cmbettingapi/getobdeposits`);
    const depositData = await depositRes.json();
    const deposits = depositData.deposits;

    const depositText = document.querySelector('#deposits');
    depositText.textContent = `£${deposits}`;

    const moneyRes = await fetch(`/cmbettingapi/getmoneyinfo`);
    const moneyData = await moneyRes.json();
    const profit = moneyData.data.profit;

    const profitText = document.querySelector('#profit');
    profitText.textContent = `£${profit}`;
}


document.addEventListener("DOMContentLoaded", async function(e) {

    await setUpMoney();
    await setUpBookmakers();

});