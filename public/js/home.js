function setUpFAQ() {
    let faqTriggers = document.querySelectorAll('.faq_question');
    faqTriggers.forEach(faqTrigger => {
        faqTrigger.addEventListener('click', function() {
            const faqTriggerID = faqTrigger.getAttribute('id');
            console.log(faqTriggerID);
            for (let i = 1; i < 6; i++) {
                if (faqTriggerID === `home-trigger-${i}`) {
                    let targetAnswer = document.querySelector(`#homefaq-${i}`);
                    const style = window.getComputedStyle(targetAnswer);

                    if (style.display === 'none') {
                        targetAnswer.style.display = 'block';
                    } else {
                        targetAnswer.style.display = 'none';
                    }
                }
            }
        });
    });


}

document.addEventListener("DOMContentLoaded", function() {
    console.log('being run')
    setUpFAQ();
});