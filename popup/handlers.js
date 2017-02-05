(() => {
    var plus = document.getElementById('plus');
    var gettingIconsData = browser.storage.local.get('iconsData');
    var iconsData = [];
    var icons = [plus];
    //declaring toggling value for remove icon sign
    var toggleRem = false;

    //decalaring searching index function 
    //returns true when the value of the index = 0 
    function isThere(url) {
        for (let i = 0; i < this.length; i++) {
            if (this[i].url === url) {
                return i || true;
            }
        }
        return false;
    }

    gettingIconsData.then(val => {
        try {
            if (val != null) {
                iconsData = JSON.parse(val.iconsData);
                insertIcons(iconsData);
            }
        } catch (e) {
            console.log('parsing localStorage error: ', e);
        } finally {
            iconsData.isThere = isThere;
        }
    }, error => {
        console.log('Getting icons\' data error: ', error);
    });

    function insertIcons(iconsData) {
        //setting icons on the popup
        //getting icons objects array
        for (var i = 0; i < iconsData.length; i++) {
            var icon = createIcon(iconsData[i].url, iconsData[i].favIcon);
            icons[i].insertAdjacentElement('beforebegin', icon);
            icons.push(icon);
        }
    }

    //there is a bug with plus button animation
    //it still not working
    //will be fixed soon
    var plusIcon = plus.firstChild.nextSibling;
    handleClick(plusIcon);
    //Inserting new icons
    plus.addEventListener('click', e => {
        var gettingActiveTab = browser.tabs.query({ active: true, currentWindow: true });
        gettingActiveTab.then(tabs => {
            //getting current tab
            var currentTab = tabs[0];
            var curUrl = currentTab.url;
            var reg = /^about:/;
            var test1 = iconsData.isThere(curUrl);
            var test2 = reg.test(curUrl);
            //stopping the process if the url already
            //inside the iconsData
            if (test1 || test2)
                return;
            //creating new icon object
            var newIcon = createIcon(currentTab.url, currentTab.favIconUrl);
            //creating new data object
            var newIconData = {
                url: currentTab.url,
                favIcon: currentTab.favIconUrl
            };
            //adding new data object
            iconsData.push(newIconData);
            //updating data in the local storage
            updateData(iconsData);
            //setting the new element to the popup document 
            icons[icons.length - 1].insertAdjacentElement('beforebegin', newIcon);
            //adding new icon to the icon elements array
            icons.push(newIcon);
        });
    }, true);

    //Creating new 'div' element with 'icon' class 
    //Also providing wrapper for it. I set wrapper to fix clicking animation
    //Adding listeners for navigeting
    function createIcon(url, favIconUrl) {
        var newIcon = document.createElement('div');
        newIcon.classList.add('icon');
        newIcon.style.backgroundImage = 'url(' + favIconUrl + ')';
        handleClick(newIcon);
        
        //the romove icon sign
        var remIcn = document.createElement('div');
        remIcn.classList.add('rem');
        remIcn.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            removeIcon(url);
        });

        var newWrapper = document.createElement('div');
        newWrapper.classList.add('wrapper');

        newIcon.addEventListener('mousedown', e => {
            e.preventDefault();
            if (e.button == 0) {
                //left click opens the url in the current tab
                browser.tabs.update({ url });
            } else if (e.button == 1) {
                //middle button or wheel click opens the url 
                //in the new tab  
                browser.tabs.create({ url });
            } else if (e.button == 2) {
                //toggling remove sign displaying
                if (!toggleRem) {
                    remIcn.style.display = 'block';
                    toggleRem = true;
                } else {
                    remIcn.style.display = 'none';
                    toggleRem = false;
                }
            }
        });

        newIcon.insertAdjacentElement('afterbegin', remIcn);

        newWrapper.insertAdjacentElement('afterbegin', newIcon);

        return newWrapper;
    }

    //Handling click animation of icons
    function handleClick(el) {
        el.addEventListener('mousedown', e => {
            e.target.classList.add('clicked');
        }, true);
        el.addEventListener('mouseup', e => {
            e.target.classList.remove('clicked');
        }, true);
    }

    function removeIcon(url) {
        var id = (iconsData.isThere(url) === true) ? 0 : iconsData.isThere(url);
        var length = iconsData.length;
        //sliding all the elements of the array 
        //by 1 position back 
        //setting new boundaries of the array
        if (id + 1) {
            for (let i = id; i < length - 1; i++) {
                iconsData[i] = iconsData[i + 1];
            }
            iconsData.length = length - 1;
            //and updating data in local storage
            updateData(iconsData);
            window.location.reload();
        }
    }

    function updateData(iconsData) {
        browser.storage.local.set({ 'iconsData': JSON.stringify(iconsData) });
    }
})()