async function loadAffiliate(userid) {
    const res = await fetch(`/cmbettingapi/affiliatedata/`)
    const data = await res.json()

    if (data.data.success) {
        let codeText = document.querySelector('#affiliate-code');
        codeText.textContent = data.data.code;
    }
}

document.addEventListener("DOMContentLoaded", async function() {

    try {
        const firstName = userDetails.details.given_name;
        const lastName = userDetails.details.family_name;

        const fullName = `${lastName}, ${firstName}`
        document.getElementById('menu-fullname').textContent = `${fullName}`; 

        await loadAffiliate();


    } catch(error) {
        console.error('error with getting the user id', error);
    }

});