function showdarkm() {
    if (localStorage.getItem("isdarkm") === null) {
        localStorage.setItem("isdarkm", 'y');
    }
    if (localStorage.getItem("isdarkm") === 'y') {
        document.body.classList.add('godark');
        if (document.getElementById("deprecmodshid")) {
            document.getElementById("deprecmodwhole").style.color = "Pink";
        }
    }
}

function toggledarkmode() {
    const isnowdark = document.body.classList.toggle('darkmode');
    if (localStorage.getItem("isdarkm") === "n" || localStorage.getItem("isdarkm") === null) {
        localStorage.setItem("isdarkm", "y");
    } else {
        localStorage.setItem("isdarkm", "n");
    }
    location.href = "";
}

function settingshow() {
    let showmoddescrip;
    if (localStorage.getItem("showmoddescrip") === "n") showmoddescrip = false;
    else showmoddescrip = true;
    const moddesccheckb = document.getElementById("showmoddescrip");
    if (moddesccheckb) moddesccheckb.checked = showmoddescrip;
    let showmodauth;
    if (localStorage.getItem("showmodauth") === "n") showmodauth = false;
    else showmodauth = true;
    const modmakbox = document.getElementById("showmodauth");
    if (modmakbox) modmakbox.checked = showmodauth;
    const modsize = localStorage.getItem("modsize");
    const modgriddaae = document.querySelector(".modgridd");
    if (modgriddaae) {
        modgriddaae.classList.add(modsize || "msiz-card");
        modgriddaae.classList.toggle("hidemoddescrip", !showmoddescrip);
        modgriddaae.classList.toggle("hidemodcreato", !showmodauth);
    }
    const modsizeboxaae = document.getElementById("modsize");
    if (modsizeboxaae) modsizeboxaae.value = modsize || "msiz-card";
}

function settingscri_moddesc() {
    const moddesccheckb = document.getElementById("showmoddescrip");
    if (moddesccheckb.checked) localStorage.setItem("showmoddescrip", "y");
    else localStorage.setItem("showmoddescrip", "n");
    settingshow();
}

function settingscri_modmaker() {
    const moddesccheckb = document.getElementById("showmodauth");
    if (moddesccheckb.checked) localStorage.setItem("showmodauth", "y");
    else localStorage.setItem("showmodauth", "n");
    settingshow();
}

function settingscri_modsize() {
    const modsizeboxaae = document.getElementById("modsize");
    localStorage.setItem("modsize", modsizeboxaae.value);
    settingshow();
}
showdarkm();
settingshow();
const moddesccheckb = document.getElementById("showmoddescrip");
const modmakbox = document.getElementById("showmodauth");
if (moddesccheckb) moddesccheckb.addEventListener("change", settingscri_moddesc);
if (modmakbox) modmakbox.addEventListener("change", settingscri_modmaker);