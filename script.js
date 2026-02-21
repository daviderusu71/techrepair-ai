/* ========================= */
/*   VARIABILE GLOBALE      */
/* ========================= */

let isAdmin = false;

let finalComponent = "";
let finalPercent = 0;

let currentProblem = "";


/* ========================= */
/*   WIZARD DIAGNOSTIC      */
/* ========================= */

function nextStep(step){

    if(step === 1){
        currentProblem = document.getElementById("problem").value;

        if(!currentProblem){
            alert("Selectează o problemă înainte!");
            return;
        }

        generateQuestions();
        updateProgress(33);
    }

    document.getElementById("step"+step).classList.remove("active");
    document.getElementById("step"+(step+1)).classList.add("active");
}

function updateProgress(percent){
    document.querySelector(".progress").style.width = percent + "%";
}

function generateQuestions(){

    const q = document.getElementById("questions");
    q.innerHTML = "";

    if(currentProblem === "no_power"){
        q.innerHTML = `
            <p>Sursa face zgomot?</p>
            <select id="q1">
                <option value="yes">Da</option>
                <option value="no">Nu</option>
            </select>
        `;
    }

    if(currentProblem === "slow"){
        q.innerHTML = `
            <p>Ai SSD instalat?</p>
            <select id="q1">
                <option value="yes">Da</option>
                <option value="no">Nu</option>
            </select>
        `;
    }

    if(currentProblem === "overheat"){
        q.innerHTML = `
            <p>Ai curățat ventilatoarele?</p>
            <select id="q1">
                <option value="yes">Da</option>
                <option value="no">Nu</option>
            </select>
        `;
    }
}

function analyze(){

    document.getElementById("step2").classList.remove("active");
    document.getElementById("step3").classList.add("active");
    updateProgress(66);

    setTimeout(() => {
        calculateResult();
    }, 2000);
}

function calculateResult(){

    const answer = document.getElementById("q1")?.value;
    let component = "";
    let percent = 60;

    if(currentProblem === "no_power"){
        component = answer === "no" ? "psu" : "motherboard";
        percent = answer === "no" ? 85 : 70;
    }

    if(currentProblem === "slow"){
        component = answer === "no" ? "ssd" : "ram";
        percent = answer === "no" ? 90 : 65;
    }

    if(currentProblem === "overheat"){
        component = answer === "no" ? "fan" : "cpu";
        percent = answer === "no" ? 88 : 72;
    }

    document.getElementById("step3").classList.remove("active");
    document.getElementById("step4").classList.add("active");
    updateProgress(100);

    finalComponent = component.toUpperCase();
    finalPercent = percent;

    document.getElementById("final-result").innerText =
        "Componentă probabil defectă: " + finalComponent;

    document.getElementById("prob-fill").style.width = percent + "%";

    const img = document.getElementById("final-img");
    img.src = component + ".jpg";
    img.style.display = "block";

    saveToHistory();
}


/* ========================= */
/*   ISTORIC + DASHBOARD    */
/* ========================= */

function saveToHistory(){

    const historyItem = {
        date: new Date().toLocaleString(),
        problem: currentProblem,
        component: finalComponent,
        percent: finalPercent
    };

    let history = JSON.parse(localStorage.getItem("diagnosticHistory")) || [];
    history.push(historyItem);

    localStorage.setItem("diagnosticHistory", JSON.stringify(history));

    displayHistory();
    updateDashboard();
    generateUpgradeRecommendation();
}

function displayHistory(){

    const historyDiv = document.getElementById("history");
    let history = JSON.parse(localStorage.getItem("diagnosticHistory")) || [];

    historyDiv.innerHTML = "";

    history.slice().reverse().forEach(item => {
        historyDiv.innerHTML += `
            <p>
            <strong>${item.date}</strong><br>
            Problemă: ${item.problem}<br>
            Componentă: ${item.component} (${item.percent}%)
            </p><hr>
        `;
    });
}

function updateDashboard(){

    let history = JSON.parse(localStorage.getItem("diagnosticHistory")) || [];

    if(history.length === 0) return;

    document.getElementById("total-diagnoses").innerText = history.length;

    let componentCount = {};
    let totalPercent = 0;

    history.forEach(item => {
        componentCount[item.component] =
            (componentCount[item.component] || 0) + 1;

        totalPercent += item.percent;
    });

    const topComponent = Object.keys(componentCount)
        .reduce((a,b) => componentCount[a] > componentCount[b] ? a : b);

    document.getElementById("top-component").innerText = topComponent;
    document.getElementById("avg-percent").innerText =
        Math.round(totalPercent / history.length) + "%";
}


/* ========================= */
/*   AI UPGRADE              */
/* ========================= */

function generateUpgradeRecommendation(){

    let history = JSON.parse(localStorage.getItem("diagnosticHistory")) || [];
    const message = document.getElementById("upgrade-message");

    if(history.length < 2){
        message.innerText =
            "Sunt necesare mai multe diagnoze pentru analiză AI.";
        return;
    }

    let componentCount = {};

    history.forEach(item => {
        componentCount[item.component] =
            (componentCount[item.component] || 0) + 1;
    });

    const topComponent = Object.keys(componentCount)
        .reduce((a,b) => componentCount[a] > componentCount[b] ? a : b);

    message.innerText =
        "Recomandare AI: verificați sau faceți upgrade la " + topComponent;
}


/* ========================= */
/*   BOOKING SYSTEM         */
/* ========================= */

document.getElementById("bookingForm").addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("clientName").value;
    const email = document.getElementById("clientEmail").value;
    const service = document.getElementById("serviceType").value;
    const date = document.getElementById("bookingDate").value;
    const time = document.getElementById("bookingTime").value;

    const costText = document.getElementById("estimatedCost").innerText;
    const cost = parseInt(costText.replace(/\D/g,''));

    const booking = { name, email, service, date, time, cost };

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(booking);

    localStorage.setItem("bookings", JSON.stringify(bookings));

    displayBookings();
    this.reset();
});

function displayBookings(){

    const bookingList = document.getElementById("bookingList");
    bookingList.innerHTML = "";

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    bookings.forEach((booking, index) => {

        bookingList.innerHTML += `
            <div class="booking-card">
                <strong>${booking.name}</strong><br>
                Email: ${booking.email}<br>
                Serviciu: ${booking.service}<br>
                Data: ${booking.date} | Ora: ${booking.time}<br>
                Cost: ${booking.cost} RON<br>

                ${isAdmin ? `<button onclick="deleteBooking(${index})">Șterge</button>` : ""}

            </div>
        `;
    });
}

function deleteBooking(index){

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.splice(index, 1);

    localStorage.setItem("bookings", JSON.stringify(bookings));
    displayBookings();
}


/* ========================= */
/*   ADMIN LOGIN            */
/* ========================= */

function adminLogin(){

    const pass = document.getElementById("adminPass").value;

    if(pass === "1234"){
        isAdmin = true;
        document.getElementById("adminMessage").innerText =
            "Autentificare reușită!";
        displayBookings();
    } else {
        document.getElementById("adminMessage").innerText =
            "Parolă greșită!";
    }
}


/* ========================= */
/*   INIT PAGE              */
/* ========================= */

window.onload = function(){
    displayHistory();
    updateDashboard();
    displayBookings();
    generateUpgradeRecommendation();
};