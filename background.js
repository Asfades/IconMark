browser.tabs.onUpdated.addListener(() => {
    var gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true });
    gettingActiveTab.then(tabs => {
        //taking active tab
        var curTab = tabs[0];
        browser.pageAction.hide(curTab.id);
        //declaring the object that willcontain data from local store
        var iconsData;
        var gettingData = browser.storage.local.get('iconsData');
        gettingData.then(val => {
            try {
                //parsing local store
                iconsData = JSON.parse(val.iconsData);
            } catch (e) {
                iconsData = [];
            }

            iconsData.isThere = isThere;
            //stoping the process if there is such a link in the iconsData
            if (iconsData.isThere(curTab.url)) {
                return;
            } else {
                //showing pageAction in the other case
                browser.pageAction.show(curTab.id);
            }

        }, error => {
            console.log(`getting data error: ${error}`);
        });
        //avoids showing pageAction on the special pages of the browser
        if (!curTab.url.match('^about:')) {
            var boldPlus = 'icons/plus_stroked_bold.svg';

            setIcon(curTab.id, boldPlus);
            
            browser.pageAction.onClicked.addListener(() => {
                //adding new icon to existing array of icons
                iconsData.push({
                    url: curTab.url,
                    favIcon: curTab.favIconUrl
                });
                //setting new iconsData array to the local storage 
                var settingNewData = browser.storage.local.set({ 'iconsData': JSON.stringify(iconsData) });
                settingNewData.then(() => {
                    //hiding pageAction when success
                    browser.pageAction.hide(curTab.id);
                }, (error) => {
                    console.log(`setting new data error ${error}`);
                });
            });
        }
    });
});

//sets pageAction's icon
function setIcon(tabId, icon) {
    browser.pageAction.setIcon({
        tabId: tabId,
        path: icon
    });
}

//search if the storage contain the link(url)
function isThere(url) {
    for (let i = 0; i < this.length; i++) {
        if (this[i].url === url) {
            return true;
        }
    }
    return false;
}