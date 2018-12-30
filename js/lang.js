var defaults = {
    validLangs: []
}; // more in `options.js`

function parseLangs() {
    var jsonLang = JSON.parse(this.response)["sitematrix"];
    var langsCount = jsonLang["count"]
    delete jsonLang["count"]

    var validLangProfiles = Object.values(jsonLang).filter(
        function(entry) {
            let sitesList = entry["site"];
            entry["site"] = sitesList.filter(
                site => site["code"] == "wiki" &&
                typeof site["closed"] === "undefined");
            return entry["site"].length == 1;
        }
    )

    // List for storage
    defaults.validLangs = validLangProfiles.map(
        item => item["site"][0]["url"].replace(
            /https:\/\/|\.wikipedia\.org/g, ''
        )
    );
    // String to display
    document.getElementById("langs_list").innerHTML = defaults.validLangs.join(', ');

    return langsCount
}

function updateLangs() {
    var langReq = new XMLHttpRequest();
    langReq.addEventListener("load", parseLangs, false);
    langReq.open("GET", "https://commons.wikimedia.org/w/api.php?action=sitematrix&smtype=language&smlangprop=code|name|localname|site&smsiteprop=code|url&format=json");
    langReq.send();
}
