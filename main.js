const howlongtocache = 3600000;
let deprecmodscaught = 0;
let nonfuncmodscaught = 0;
let unitmodscaught = 0;
let nsfwmodscaught = 0;
let badrepmodscaught = 0;
let modpackmodscaught = 0;
let whitelistofunitslop = new Set();
let blacklistofunitslop = new Set();
let blacklistofbadrep = new Set();
let setofapprovedmods = new Set();
let filteredmodscurrent = [];
let modsshown = 0;
const howmanycookies = 24;
let sentobserv = null;
const blablaparam = new URLSearchParams(window.location.search);
const handpicked = blablaparam.get('hand');

if (handpicked && handpicked === "y") {
    document.body.classList.remove("hasdasidebarbar");
    document.getElementById("titleofpag").textContent = "Recommended & Approved Mods";
    document.querySelectorAll('.hideinaprov').forEach(function (theob) {
        theob.style.display = 'none';
    });
    document.querySelectorAll('.showinaprov').forEach(function (theob) {
        theob.style.display = 'block';
    });
}

async function getdalists(maiurl, jsdeurl) {
    try {
        const respon = await fetch(maiurl);
        if (!respon.ok) throw new Error('github list fail  ' + respon.statusText);
        const thelist = await respon.json();
        return new Set(Array.isArray(thelist) ? thelist : []);
    } catch (e) {
        console.warn('failed github trying jdel ', maiurl, e);
    }
    try {
        const backuprespon = await fetch(jsdeurl);
        if (!backuprespon.ok) throw new Error('fail jsdel ' + backuprespon.statusText);
        const backuplist = await backuprespon.json();
        return new Set(Array.isArray(backuplist) ? backuplist : []);
    } catch (e) {
        console.warn('fail jsdel', jsdeurl, e);
        return new Set();
    }
}

async function getunitacceptablelist() {
    return getdalists(
        'https://raw.githubusercontent.com/bayturtleking/TTMB-Whitelist/refs/heads/main/lowqualityunits-whitelist.json',
        'https://cdn.jsdelivr.net/gh/bayturtleking/TTMB-Whitelist@main/lowqualityunits-whitelist.json'
    );
}

async function getunitblacklist() {
    return getdalists(
        'https://raw.githubusercontent.com/bayturtleking/TTMB-Whitelist/refs/heads/main/lowqualityunits-blacklist.json',
        'https://cdn.jsdelivr.net/gh/bayturtleking/TTMB-Whitelist@main/lowqualityunits-blacklist.json'
    );
}

async function getbadrepblacklist() {
    return getdalists(
        'https://raw.githubusercontent.com/bayturtleking/TTMB-Whitelist/refs/heads/main/badrep-blacklist.json',
        'https://cdn.jsdelivr.net/gh/bayturtleking/TTMB-Whitelist@main/badrep-blacklist.json'
    );
}

async function getapprovedlis() {
    return getdalists(
        'https://raw.githubusercontent.com/bayturtleking/TTMB-Whitelist/refs/heads/main/ttmb-approved.json',
        'https://cdn.jsdelivr.net/gh/bayturtleking/TTMB-Whitelist@main/ttmb-approved.json'
    );
}

const modcachescheme = 2;  // change whenever mod obj shape changes so it has to get new cache
async function getmods() {
    const cachedcurrent = localStorage.getItem('modcachee');
    if (cachedcurrent) {
        try {
            const curdata = JSON.parse(cachedcurrent);
            if (curdata.modcachescheme === modcachescheme && Date.now() - curdata.timestamp < howlongtocache) {
                return curdata.mods;
            }
        } catch (e) {
            console.warn('no cached mods, has to get fresh', e);
        }
    }
    const respononsee = await fetch('/.netlify/functions/getmods');
    if (!respononsee.ok) {
        throw new Error('getting mods epic fail: ' + respononsee.statusText);
    }
    const thereturnedjson = await respononsee.json();
    const listderaw = Array.isArray(thereturnedjson) ? thereturnedjson : (thereturnedjson.results || thereturnedjson.packages || []);
    if (listderaw.length) {
        console.log('wait i forgot what i was gonna say:', JSON.stringify(listderaw[0], null, 2));
    }
    const mods = listderaw.map(thismod => {
        const nameofmod = thismod.name || thismod.package_name || '';
        const whomade = thismod.owner || thismod.namespace || thismod.team_name || '';
        const othername = thismod.display_name || nameofmod;
        const curversion = (thismod.versions && thismod.versions.length) ? thismod.versions[0] : (thismod.latest || thismod.version || null);
        const thedesc = thismod.description || thismod.short_description || curversion?.description || '';
        let version = (curversion && (curversion.version_number || curversion.version)) || thismod.version_number || '';
        let theicon = thismod.icon || (curversion && curversion.icon) || '';
        if (!theicon && whomade && nameofmod) {
            theicon = `https://gcdn.thunderstore.io/live/repository/icons/${whomade}-${nameofmod}-${version || 'latest'}.png`;
        }
        const isnsfw = !!(thismod.has_nsfw_content);
        const isdepre = !!(thismod.is_deprecated);
        const whatlinkshouldbe = "https://thunderstore.io" + (thismod.community_listings?.[0]?.url_path || `/c/totally-accurate-battle-simulator/p/${whomade}/${nameofmod}/`);
        const depslist = (curversion && Array.isArray(curversion.dependencies)) ? curversion.dependencies : (Array.isArray(thismod.dependencies) ? thismod.dependencies : []);
        const hasbepinex = depslist.some(depp => /bepinex/i.test(depp));

        const categoriesrawww = thismod.categories || thismod.community_listings?.[0]?.categories || [];
        const categorynameslist = (Array.isArray(categoriesrawww) ? categoriesrawww : []).map(catt => {
            if (typeof catt === 'string') return catt;
            return (catt && (catt.name || catt.slug || catt.label)) || '';
        });
        const hasmodpackcategory = categorynameslist.some(catname => /modpack/i.test(catname));
        const namesaysmodpack = /modpack/i.test(nameofmod) || /modpack/i.test(othername);
        const ismodpack = hasmodpackcategory || namesaysmodpack;

        return { nameofmod, whomade, othername, thedesc, version, theicon, whatlinkshouldbe, isdepre, isnsfw, hasbepinex, ismodpack };
    });
    try {
        localStorage.setItem('modcachee', JSON.stringify({ timestamp: Date.now(), modcachescheme, mods }));
    } catch (e) {
        console.warn('failed to add mods to cachee', e);
    }
    return mods;
}
let cacheformods = [];
function modhider(mod, dounitfilters, showdepre, shownsfw, shownonf, domodpack) {
    if (handpicked && handpicked === "y") {
        if (!setofapprovedmods.has(mod.nameofmod) || mod.isdepre) {
            return "notapproved-ordepre";
        }
        return null;
    }
    if (blacklistofbadrep.has(mod.nameofmod)) {
        return "badrep";
    }
    if (domodpack !== "y" && mod.ismodpack) {
        return "modpack";
    }
    if (dounitfilters !== "y") {
        const unitcheckregex = /^(?!.*\b(?:compaign|campaign)\b)(?!.*\bsummon\w*\b).*?(?:\b(?:new|secret|hidden|random|add|adds|added|weird)\b(?:\s+\w+){0,3}\s+\b(?:units?(?!\s*(?:bases?|creator|maker))|factions?)\b|\b\d+\s+units?\b|\bweird\s+powerful\s+units?\b|\badded\s+units?\b|\badded\s+factions?\b)/i;
        if (!whitelistofunitslop.has(mod.nameofmod) && unitcheckregex.test(mod.thedesc)) {
            console.log("low quality unit mod likely?: " + mod.nameofmod);
            return "unit";
        }
        if (blacklistofunitslop.has(mod.nameofmod)) {
            console.log("low quality unit mod likely?: " + mod.nameofmod);
            return "unit";
        }
    }
    if (shownonf !== "y") {
        if (!mod.hasbepinex) {
            return "nonfunc";
        }
    }
    if (showdepre !== "y") {
        if (mod.isdepre) {
            return "depre";
        }
    }
    if (shownsfw !== "y") {
        if (mod.isnsfw) {
            return "nsfw";
        }
    }
    return null;
}
function nextbatchofcookies(theplaceholdermodthing, gridsofmodss, eldiv) {
    const thenextpartt = filteredmodscurrent.slice(modsshown, modsshown + howmanycookies);
    if (!thenextpartt.length) return;
    const fraggrenade = document.createDocumentFragment();
    thenextpartt.forEach(mod => {
        const themodtouse = theplaceholdermodthing.cloneNode(true);
        themodtouse.id = '';
        themodtouse.style.display = '';
        const titletext = themodtouse.querySelector('h1');
        if (titletext) titletext.textContent = mod.othername || mod.nameofmod || 'idk what its called';
        const theimagething = themodtouse.querySelector('img');
        if (theimagething) {
            theimagething.src = mod.theicon || '';
            theimagething.loading = 'lazy';
            theimagething.decoding = 'async';
        }
        themodtouse.addEventListener("click", () => {
            window.location.href = mod.whatlinkshouldbe;
        });
        fraggrenade.appendChild(themodtouse);
    });
    gridsofmodss.insertBefore(fraggrenade, eldiv);
    modsshown += thenextpartt.length;
    if (modsshown >= filteredmodscurrent.length && sentobserv) {
        sentobserv.disconnect();
    }
}
function showthemods(mods) {
    deprecmodscaught = 0;
    unitmodscaught = 0;
    nsfwmodscaught = 0;
    nonfuncmodscaught = 0;
    badrepmodscaught = 0;
    modpackmodscaught = 0;
    const theplaceholdermodthing = document.getElementById('modtemplatee');
    if (!theplaceholdermodthing) {
        console.warn('erm wheres the template');
        return;
    }
    const gridsofmodss = document.getElementById("themods");
    if (!gridsofmodss) return;
    theplaceholdermodthing.style.display = 'none';
    Array.from(gridsofmodss.children).forEach(childd => {
        if (childd !== theplaceholdermodthing && childd.classList.contains('mod')) childd.remove();
    });
    const oldsent = document.getElementById('thesentofmods');
    if (oldsent) oldsent.remove();
    const dounitfilters = blablaparam.get('all');
    const showdepre = blablaparam.get('d');
    const shownonf = blablaparam.get('nf');
    const shownsfw = blablaparam.get('n');
    const domodpack = blablaparam.get('mp');
    const dorev = blablaparam.get('re');
    filteredmodscurrent = [];
    mods.forEach(mod => {
        const hidereason = modhider(mod, dounitfilters, showdepre, shownsfw, shownonf, domodpack);
        if (hidereason === "unit") unitmodscaught += 1;
        else if (hidereason === "depre") deprecmodscaught += 1;
        else if (hidereason === "nsfw") nsfwmodscaught += 1;
        else if (hidereason === "nonfunc") nonfuncmodscaught += 1;
        else if (hidereason === "badrep") badrepmodscaught += 1;
        else if (hidereason === "modpack") modpackmodscaught += 1;
        const wouldnormallybehidden = hidereason !== null;
        const shouldhidenow = dorev === "y" ? !wouldnormallybehidden : wouldnormallybehidden;
        if (!shouldhidenow) {
            filteredmodscurrent.push(mod);
        }
    });
    document.getElementById("unitmodshid").textContent = unitmodscaught;
    document.getElementById("nsfwmodshid").textContent = nsfwmodscaught;
    document.getElementById("deprecmodshid").textContent = deprecmodscaught;
    document.getElementById("nonfunctmods").textContent = nonfuncmodscaught;
    const modpackcountel = document.getElementById("modpackmodshid");
    if (modpackcountel) modpackcountel.textContent = modpackmodscaught;
    modsshown = 0;
    if (sentobserv) {
        sentobserv.disconnect();
        sentobserv = null;
    }
    const eldiv = document.createElement('div');
    eldiv.id = 'thesentofmods';
    eldiv.style.gridColumn = '1 / -1';
    eldiv.style.height = '1px';
    gridsofmodss.appendChild(eldiv);
    sentobserv = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                nextbatchofcookies(theplaceholdermodthing, gridsofmodss, eldiv);
            }
        });
    }, { rootMargin: '600px' });
    sentobserv.observe(eldiv);
    nextbatchofcookies(theplaceholdermodthing, gridsofmodss, eldiv);
}
function redowithnewfilters() {
    const searchbarr = document.getElementById('searchformod');
    const qqqq = searchbarr ? (searchbarr.value || '').trim().toLowerCase() : '';
    if (!qqqq) {
        showthemods(cacheformods);
        return;
    }
    const filterrrreddd = cacheformods.filter(m => {
        const nameee = (m.othername || m.nameofmod || '').toLowerCase();
        const ownerrr = (m.whomade || '').toLowerCase();
        const desccc = (m.thedesc || '').toLowerCase();
        return nameee.includes(qqqq) || ownerrr.includes(qqqq) || desccc.includes(qqqq);
    });
    showthemods(filterrrreddd);
}
function updatefilter() {
    const theparamss = new URLSearchParams(window.location.search);
    document.querySelectorAll('.dasidebarfilter').forEach(buttonnn => {
        const nameofp = buttonnn.dataset.param;
        const isitact = theparamss.get(nameofp) === "y";
        buttonnn.classList.toggle('active', isitact);
        buttonnn.setAttribute('aria-pressed', isitact ? 'true' : 'false');
    });
}
function togglefilterrr(paramname) {
    const theurl = new URL(window.location.href);
    const currentval = theurl.searchParams.get(paramname);
    if (currentval === "y") {
        theurl.searchParams.delete(paramname);
    } else {
        theurl.searchParams.set(paramname, "y");
    }
    history.replaceState(null, '', theurl.toString());
    updatefilter();
    redowithnewfilters();
}
function dofilters() {
    document.querySelectorAll('.dasidebarfilter').forEach(btn => {
        btn.addEventListener('click', () => {
            togglefilterrr(btn.dataset.param);
        });
    });
    updatefilter();
}
(async function blablabla() {
    try {
        dofilters();
        const [mods, dawhitelist, unitblacklist, badrepblacklist, approvedlistofmo] = await Promise.all([
            getmods(),
            getunitacceptablelist(),
            getunitblacklist(),
            getbadrepblacklist(),
            getapprovedlis()
        ]);
        whitelistofunitslop = dawhitelist;
        blacklistofunitslop = unitblacklist;
        blacklistofbadrep = badrepblacklist;
        setofapprovedmods = approvedlistofmo;
        cacheformods = mods;
        showthemods(cacheformods);
        const searchbarr = document.getElementById('searchformod');
        if (searchbarr) {
            const params = new URLSearchParams(window.location.search);
            const thesearchquery = params.get('qqqq') || '';
            if (thesearchquery) searchbarr.value = thesearchquery;
            searchbarr.addEventListener('input', redowithnewfilters);
            if (thesearchquery) {
                redowithnewfilters();
            }
        }
    } catch (e) {
        console.error('failed to show or load mods :(', e);
    }
})();