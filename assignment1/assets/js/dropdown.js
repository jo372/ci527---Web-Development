
/**
 * @param {string} text the text you want to add to the dropdown button
 * @returns {HTMLLIElement}
 */
function createDropdownButton(text) {
    const dropdownHeader = document.createElement('li');
    dropdownHeader.innerText = text;
    dropdownHeader.tabIndex = 0;
    dropdownHeader.setAttribute('aria-labelledby', `filters results by locations beginning with: '${text}'`);
    dropdownHeader.addClass('dropdown-btn');
    return dropdownHeader;
}

/**
 * Remove the previous selected record from the document.
 */
function removePreviousSelectedRecord() {
    // if it is a touch device, we attempt to get the last selected item and then switch the attribute to false.
    if (isTouchDevice()) {
        const lastSelectedItem = document.querySelector('.record[data-istouched="true"]');

        if (lastSelectedItem) {
            lastSelectedItem.dataset.istouched = false;
        }
    }
}

/**
 * @param {string[]} categories the categories you want to create a dropdown for.
 * @returns {HTMLDivElement} the div which contains all the newly created categories.
 */
function createDropdownFilters(categories) {
    // if categories has been passed and is an array.
    if (categories && Array.isArray(categories)) {
        // creating an object which will hold the button names 'X', 'Y', 'Z' etc. By default we want an All button, so we've added it.
        const dropdownHeaders = {
            'All': []
        };

        // creating a temporary container which will be returned when finished.
        const container = createDivWithClass('container');

        //  looping through the categories an appending them to our json object dropdownHeaders
        //  it should be looking something like this:
        //  'E': ['England', 'Egypt', 'El Salvador'],
        //  'F': ['Finland', 'France'] and so on.

        categories.forEach(category => {
            // getting the key (the first letter) and checking if it's not been appended yet, if not we add it to our object and create an array to hold the subfields.
            const key = category.charAt(0).toUpperCase();
            if (!dropdownHeaders[key]) {
                dropdownHeaders[key] = new Array();
            }
            dropdownHeaders[key].push(category);
        });

        // creating a dropdown which will hold our dropdown header (button which starts with location name 'A' etc...)
        for (const [key, headers] of Object.entries(dropdownHeaders)) {
            const dropdown = createDivWithClass('dropdown');
            const dropdownHeader = createDropdownButton(key);
            // this was to help with accessibility (but doesn't not bode well with screen readers. In future make this
            // <ul role="toolbar">
            //     <li><button aria-setsize="4" aria-posinset="1">Button 1</button></li>
            //     <li><button aria-setsize="4" aria-posinset="2">Button 2</button></li>
            //     <li><button aria-setsize="4" aria-posinset="3">Button 3</button></li>
            //     <li><button aria-setsize="4" aria-posinset="4">Button 4</button></li>
            // </ul>
            dropdownHeader.addEventListener("keydown", e => {
                // if the users keyboard is on the button and they press either space or Enter we want to open the menu for them.
                if (e.key === " " || e.key == "Enter") {
                    e.target.click();
                }
            });

            // creating a dropdown which will hold all of the subfields
            const dropdownContent = createDivWithClass('dropdown-content');

            // if the key is All, we don't want to do much apart from append click events which will unveal all the items that are hidden.
            if (key === 'All') {
                dropdownHeader.addEventListener('click', function () {
                    let records = document.querySelectorAll('.record');
                    records.forEach(record => {
                        // these items no longer need to be hidden from the screen reader.
                        record.setAttribute('aria-hidden', 'false');
                        // seeing if it's inactive, if so make it active again!
                        if (record.containsClass("inactive")) {
                            record.toggleClass("inactive");
                            record.toggleClass("active");
                        }

                    });

                    // scrolling to the first item in the records array, which in theory should be the first item of it's type (I prefiltered them to cluster them together as there was a bug).
                    // I originall intended to make it a horizontal scroll bar and it worked perfectly (should be relatively fixed now).
                    scrollToElement(records[0]);
                });
            } else {

                // looping through all subheaders 'England', 'Egypt' etc.
                for (const subheader of headers) {
                    // creating a subheader which is a list item, making sure you can access it via screen readers (of course this doesn't work as I haven't implemented actual buttons.)
                    const subheaderNode = document.createElement('li');
                    subheaderNode.innerText = subheader;
                    subheaderNode.tabIndex = 0;
                    subheaderNode.setAttribute('aria-labelledby', `filters results by location: '${subheader}'`);

                    // adding a keydown event if the user presses space or Enter they can then access the filter content.
                    subheaderNode.addEventListener("keydown", e => {
                        if (e.key === " " || e.key === "Enter") {
                            e.target.click();
                        }
                    });

                    // adding another event listener for people who aren't using screen readers, on click event which is the event which is fired when someone with accessibility is using it.
                    subheaderNode.addEventListener('click', function () {
                        // showing the subheaders to the user 
                        dropdownContent.classList.toggle('show');

                        // removing any previously selected records
                        removePreviousSelectedRecord();

                        // getting the selected category name 
                        const selectedCategoryName = encodeURI(this.innerText.toLowerCase().trim());

                        // getting the non selected categories
                        let nonSelectedCategoryItems = document.querySelectorAll(`.record:not([data-category="${selectedCategoryName}"])`);
                        nonSelectedCategoryItems = Array.from(nonSelectedCategoryItems);
                        nonSelectedCategoryItems.forEach(nonSelectedCategoryItem => {
                            // these should always be active, now we set it to be inactive and not tabbable by the user.
                            if (nonSelectedCategoryItem.containsClass("active")) {
                                nonSelectedCategoryItem.toggleClass("active");
                                nonSelectedCategoryItem.addClass("inactive");
                                nonSelectedCategoryItem.tabIndex = "-1";
                                nonSelectedCategoryItem.setAttribute('aria-hidden', 'true');

                                // hiding the url also from the screen reader.
                                const viewSource = nonSelectedCategoryItem.querySelector('a.source');
                                viewSource.tabIndex = nonSelectedCategoryItem.tabIndex;
                                viewSource.setAttribute('aria-hidden', 'true');
                            }

                        });

                        // getting the selected category items 
                        let selectedCategoryItems = document.querySelectorAll(`.record[data-category="${selectedCategoryName}"]`);
                        // making sure it's an array
                        selectedCategoryItems = Array.from(selectedCategoryItems);
                        // making sure there's more than 0 items within the array.
                        if (selectedCategoryItems.length > 0) {
                            // looping through the items and making sure they can be selected and aren't hidden from the screen reader.
                            selectedCategoryItems.forEach(selectedCategoryItem => {
                                selectedCategoryItem.tabIndex = 0;
                                selectedCategoryItem.setAttribute('aria-hidden', 'false');

                                const viewSource = selectedCategoryItem.querySelector('a.source');
                                viewSource.tabIndex = selectedCategoryItem.tabIndex;
                                viewSource.setAttribute('aria-hidden', 'false');

                                // if it was inactive, make it active.
                                if (selectedCategoryItem.containsClass("inactive")) {
                                    selectedCategoryItem.toggleClass("inactive");
                                    selectedCategoryItem.toggleClass("active");
                                }
                            });
                            // scrolling to the first element.
                            scrollToElement(selectedCategoryItems[0]);
                        }

                    });
                    dropdownContent.appendChild(subheaderNode);
                }
            }

            dropdown.append(dropdownHeader, dropdownContent);
            container.appendChild(dropdown);
        }
        return container;
    }
}

/**
 * hides all current open dropdowns, this is called when the user clicks off the screen etc.
 */
function hideAllDropdowns() {
    // hiding all the current selected dropdowns so we can show our newly selected one.
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    for (let i = 0; i < allDropdowns.length; i++) {
        const openDropdown = allDropdowns[i];
        if (openDropdown.containsClass('show')) {
            openDropdown.removeClass('show');
        }
    }
}
