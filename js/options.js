var data = {};
try {
    data = JSON.parse(localStorage.options);
} catch (e) {}

var defaults = {
    lang: '',
    validLangs: [
        "ab", "ace", "ady", "af", "ak", "als", "am", "an", "ang", "ar", "arc", "arz", "as", "ast", "atj", "av", "ay", "az", "azb", "ba", "bar", "bat-smg", "bcl", "be", "be-tarask", "bg", "bh", "bi", "bjn", "bm", "bn", "bo", "bpy", "br", "bs", "bug", "bxr", "ca", "cbk-zam", "cdo", "ce", "ceb", "ch", "chr", "chy", "ckb", "co", "cr", "crh", "cs", "csb", "cu", "cv", "cy", "da", "de", "din", "diq", "dsb", "dty", "dv", "dz", "ee", "el", "eml", "en", "eo", "es", "et", "eu", "ext", "fa", "ff", "fi", "fiu-vro", "fj", "fo", "fr", "frp", "frr", "fur", "fy", "ga", "gag", "gan", "gd", "gl", "glk", "gn", "gom", "gor", "got", "gu", "gv", "ha", "hak", "haw", "he", "hi", "hif", "hr", "hsb", "ht", "hu", "hy", "ia", "id", "ie", "ig", "ik", "ilo", "inh", "io", "is", "it", "iu", "ja", "jam", "jbo", "jv", "ka", "kaa", "kab", "kbd", "kbp", "kg", "ki", "kk", "kl", "km", "kn", "ko", "koi", "krc", "ks", "ksh", "ku", "kv", "kw", "ky", "la", "lad", "lb", "lbe", "lez", "lfn", "lg", "li", "lij", "lmo", "ln", "lo", "lrc", "lt", "ltg", "lv", "mai", "map-bms", "mdf", "mg", "mhr", "mi", "min", "mk", "ml", "mn", "mr", "mrj", "ms", "mt", "mwl", "my", "myv", "mzn", "na", "nah", "nap", "nds", "nds-nl", "ne", "new", "nl", "nn", "no", "nov", "nrm", "nso", "nv", "ny", "oc", "olo", "om", "or", "os", "pa", "pag", "pam", "pap", "pcd", "pdc", "pfl", "pi", "pih", "pl", "pms", "pnb", "pnt", "ps", "pt", "qu", "rm", "rmy", "rn", "ro", "roa-rup", "roa-tara", "ru", "rue", "rw", "sa", "sah", "sat", "sc", "scn", "sco", "sd", "se", "sg", "sh", "shn", "si", "simple", "sk", "sl", "sm", "sn", "so", "sq", "sr", "srn", "ss", "st", "stq", "su", "sv", "sw", "szl", "ta", "tcy", "te", "tet", "tg", "th", "ti", "tk", "tl", "tn", "to", "tpi", "tr", "ts", "tt", "tum", "tw", "ty", "tyv", "udm", "ug", "uk", "ur", "uz", "ve", "vec", "vep", "vi", "vls", "vo", "wa", "war", "wo", "wuu", "xal", "xh", "xmf", "yi", "yo", "za", "zea", "zh", "zh-classical", "zh-min-nan", "zh-yue", "zu"
    ]
};  // updated: 2018-12-30

var options = {};
for (var id in defaults) {
    options[id] = data[id] === undefined ? defaults[id] : data[id];
}

window.onload = function() {
    var save = document.getElementById('save');
    var items = document.querySelectorAll('.lang');
    for (var i = 0; i < items.length; i++) {
        items[i].textContent = chrome.i18n.getMessage(items[i].id);
    }

    save.value = chrome.i18n.getMessage('save');

    document.getElementById('restore_defaults').addEventListener(
        'click',
        function() {
            window.localStorage.options = JSON.stringify(defaults);
            location.reload();
        }
    );

    if (options.lang) {
        document.getElementById('lang').value = options.lang;
    } else {
        chrome.i18n.getAcceptLanguages(function(languages) {
            document.getElementById('lang').value = languages[0].substr(0, 2);
        });
    }

    document.getElementById('form').addEventListener('submit', function(e) {
        e.preventDefault();
        var data = {
            lang: document.getElementById('lang').value
        }
        if (!options.validLangs.includes(data.lang)) {
            alert('Invalid Language! Try updating language list below. ');
            return false;
        }
        window.localStorage.options = JSON.stringify(data);
        chrome.extension.getBackgroundPage().updateOptions();
        save.className = 'saved';
        save.value = chrome.i18n.getMessage('saved');
        return false;
    });

    document.getElementById('form').addEventListener('change', function() {
        save.className = '';
        save.value = chrome.i18n.getMessage('save');
    });

    document.getElementById('update_langs').addEventListener(
        'click',
        function(e) {
            updateLangs(); // require `lang.js`; rewrite `defaults.validLangs`;
            var data = options;
            data.validLangs = defaults.validLangs;
            window.localStorage.options = JSON.stringify(data);
            chrome.extension.getBackgroundPage().updateOptions();
        }
    );
}
