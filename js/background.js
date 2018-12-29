var options = {};
var currentRequest = null;

function updateOptions(lang){
    try {
        options = JSON.parse(localStorage.options);
    }catch(e){
    }
    var defaults = {
        lang: lang          
    };
    for(var key in defaults){
        if(options[key] == undefined){
            options[key] = defaults[key];
        }
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

    updateDefaultSuggestion(text);
    
    if(text.length > 0){
        currentRequest = suggests(text, function(data) {
            var results = [];

            for(var i = 0; i < data[1].length; i++){
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
  
    req.open("GET", "https://" + options.lang + ".wikipedia.org/w/api.php?action=opensearch&namespace=0&suggest=&search=" + query, true);
    req.onload = function(){
        if(this.status == 200){
            try{                  
                callback(JSON.parse(this.responseText));
            }catch(e){
                this.onerror();
            }
        }else{
            this.onerror();
        }
    };
    req.onerror = function(){

    };
    req.send();
}

chrome.omnibox.onInputEntered.addListener(function(text) {
    chrome.tabs.update(null, {url: "https://" + options.lang + ".wikipedia.org/w/index.php?search=" + text});
});

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-7218577-47']);
_gaq.push(['_trackPageview']);

(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();