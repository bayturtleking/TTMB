function showdarkm() {
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

showdarkm();