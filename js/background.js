var options = {};
var currentRequest = null;
var currentLang = '';

var defaults = {
    lang: 'en',
    validLangs: [
        "ab", "ace", "ady", "af", "ak", "als", "am", "an", "ang", "ar", "arc", "arz", "as", "ast", "atj", "av", "ay", "az", "azb", "ba", "bar", "bat-smg", "bcl", "be", "be-tarask", "bg", "bh", "bi", "bjn", "bm", "bn", "bo", "bpy", "br", "bs", "bug", "bxr", "ca", "cbk-zam", "cdo", "ce", "ceb", "ch", "chr", "chy", "ckb", "co", "cr", "crh", "cs", "csb", "cu", "cv", "cy", "da", "de", "din", "diq", "dsb", "dty", "dv", "dz", "ee", "el", "eml", "en", "eo", "es", "et", "eu", "ext", "fa", "ff", "fi", "fiu-vro", "fj", "fo", "fr", "frp", "frr", "fur", "fy", "ga", "gag", "gan", "gd", "gl", "glk", "gn", "gom", "gor", "got", "gu", "gv", "ha", "hak", "haw", "he", "hi", "hif", "hr", "hsb", "ht", "hu", "hy", "ia", "id", "ie", "ig", "ik", "ilo", "inh", "io", "is", "it", "iu", "ja", "jam", "jbo", "jv", "ka", "kaa", "kab", "kbd", "kbp", "kg", "ki", "kk", "kl", "km", "kn", "ko", "koi", "krc", "ks", "ksh", "ku", "kv", "kw", "ky", "la", "lad", "lb", "lbe", "lez", "lfn", "lg", "li", "lij", "lmo", "ln", "lo", "lrc", "lt", "ltg", "lv", "mai", "map-bms", "mdf", "mg", "mhr", "mi", "min", "mk", "ml", "mn", "mr", "mrj", "ms", "mt", "mwl", "my", "myv", "mzn", "na", "nah", "nap", "nds", "nds-nl", "ne", "new", "nl", "nn", "no", "nov", "nrm", "nso", "nv", "ny", "oc", "olo", "om", "or", "os", "pa", "pag", "pam", "pap", "pcd", "pdc", "pfl", "pi", "pih", "pl", "pms", "pnb", "pnt", "ps", "pt", "qu", "rm", "rmy", "rn", "ro", "roa-rup", "roa-tara", "ru", "rue", "rw", "sa", "sah", "sat", "sc", "scn", "sco", "sd", "se", "sg", "sh", "shn", "si", "simple", "sk", "sl", "sm", "sn", "so", "sq", "sr", "srn", "ss", "st", "stq", "su", "sv", "sw", "szl", "ta", "tcy", "te", "tet", "tg", "th", "ti", "tk", "tl", "tn", "to", "tpi", "tr", "ts", "tt", "tum", "tw", "ty", "tyv", "udm", "ug", "uk", "ur", "uz", "ve", "vec", "vep", "vi", "vls", "vo", "wa", "war", "wo", "wuu", "xal", "xh", "xmf", "yi", "yo", "za", "zea", "zh", "zh-classical", "zh-min-nan", "zh-yue", "zu"
    ]
};

function updateOptions(updated_lang) {
    try {
        options = JSON.parse(localStorage.options);
    } catch (e) {}

    var updated = Object.assign({
        lang: updated_lang
    }, defaults); // Clone of defaults

    for (var key in updated) {
        if (options[key] == undefined && updated[key]) {
            options[key] = updated[key];
        }
    }
}

function processInput(text) {
    words = text.split(/[ \t]+/).filter(entry => entry != '');
    if (options.validLangs.includes(words[0])) {
        currentLang = words[0];
        return words.slice(1).join(' ');
    } else {
        if (!options.validLangs.includes(currentLang)) {
            currentLang = options.lang;
        }
        return text;
    }
}

chrome.i18n.getAcceptLanguages(function(languages) {
    updateOptions(languages[0].substr(0, 2));
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    if (currentRequest != null) {
        currentRequest.onreadystatechange = null;
        currentRequest.abort();
        currentRequest = null;
    }

    text = processInput(text);

    updateDefaultSuggestion(text);

    if (text.length > 0) {
        currentRequest = suggests(text, function(data) {
            var results = [];

            for (var i = 0; i < data[1].length; i++) {
                results.push({
                    content: data[1][i],
                    description: data[1][i]
                });
            }

            suggest(results);
        });
    } else {

    }
});

function resetDefaultSuggestion() {
    chrome.omnibox.setDefaultSuggestion({
        description: ' '
    });
}

resetDefaultSuggestion();
var searchLabel = chrome.i18n.getMessage('search_label');

function updateDefaultSuggestion(text) {
    chrome.omnibox.setDefaultSuggestion({
        description: searchLabel + ': %s'
    });

}

chrome.omnibox.onInputStarted.addListener(function() {
    updateDefaultSuggestion('');
});

chrome.omnibox.onInputCancelled.addListener(function() {
    resetDefaultSuggestion();
});


function suggests(query, callback) {
    var req = new XMLHttpRequest();

    req.open("GET", "https://" + currentLang + ".wikipedia.org/w/api.php?action=opensearch&namespace=0&suggest=&search=" + query, true);
    req.onload = function() {
        if (this.status == 200) {
            try {
                callback(JSON.parse(this.responseText));
            } catch (e) {
                this.onerror();
            }
        } else {
            this.onerror();
        }
    };
    req.onerror = function() {

    };
    req.send();
}

chrome.omnibox.onInputEntered.addListener(function(text) {
    text = processInput(text);
    chrome.tabs.update(null, {
        url: "https://" + currentLang + ".wikipedia.org/w/index.php?search=" + text
    });
});
