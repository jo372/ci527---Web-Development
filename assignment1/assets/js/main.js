const searchForm = document.querySelector("#searchForm");
const searchBar = document.querySelector("#searchBar");

// using query selector as I only want the first result for with the class records.
const recordsContainer = document.querySelector(".records");
const categoriesNode = document.querySelector("#categories");
const errorMessage = document.querySelector('#errorMessage');

/**
 * @param {HTMLElement} el the element you want to remove the children from 
 */
function removeAllChildrenFrom(el) {
    let child = el.firstChild;
    while (child) {
        el.removeChild(child);
        child = el.firstChild;
    }
}

/**
 * @param  {string[]} classNames the css classes you want to add to the div, got annoyed of having to keep typing addClass to a new div.
 * @returns {HTMLDivElement}
 */
function createDivWithClass(...classNames) {
    const div = document.createElement('div');
    classNames.forEach(CSSClass => {
        div.addClass(CSSClass);
    });
    return div;
}

/**
 * @param {HTMLElement} element the element you want to scroll to 
 */
function scrollToElement(element) {
    element.scrollIntoView({ behavior: 'smooth', block: "end", inline: "nearest" });
}

/**
 * @param {string} prop the property you want to filter by 
 * @returns {number} which way we should order our properties.
 */
function sortByProp(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
}  

/**
 * @param {string} query the query you want to search on vam.co.uk 
 */
function makeRequest(query) {
    // making sure that query being passed is URI encoded.
    
    query = encodeURI(query);
    
    // let url = `https://api.vam.ac.uk/v2/objects/search?q=${query}&pad=1&images=1&limit=45`;
    let url = `https://api.vam.ac.uk/v1/museumobject/search?q=${query}&pad=1&images=1&limit=45` //old API
    fetch(url).then(response => {
        // creating an array which will hold all the locations for a later date.
        let locations = [];

        // making sure the request was made okay
        if (response.status === 200) {
            
            response.json().then(response => {

                // making sure the response.records is an array 
                let records = Array.from(response.records);
                    records = records.map(r => r.fields);
                    records = records.sort(sortByProp("place"));

                    // if for some reasons there are no results, removeAllCategories from the categories object and display an error message.
                    if(records.length === 0) {
                        removeAllChildrenFrom(categories);
                        errorMessage.textContent = `No Content could be found for "${decodeURI(query)}" :(`;
                        errorMessage.style.display = "block";
                    } else {
                        errorMessage.style.display = "none";
                        recordsContainer.style.marginTop = '75px';

                        // looping through the records and pushing the location to our locations array which is used later to create the categories.
                        for (let i = 0; i < records.length; i++) {
                            let recordData = records[i];
                            let record = Record(recordData);

                            if (recordData.place.trim() !== "") {
                                locations.push(recordData.place);
                            }
                            recordsContainer.appendChild(record);
                        }
        
                        // creating the categories from the locations array which we just created.
                        let locationCategories = new Set(locations);
                            locationCategories = Array.from(locationCategories).sort();
        
                        // removing all the child nodes from categories
                        removeAllChildrenFrom(categories);
                        
                        // appending the dropdown filters to our categories object.
                        categories.append(createDropdownFilters(locationCategories));
                    }
            });
        }
    }).catch(err => console.log(err));
}

searchForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // clearing the search results from the screen as this is a SPA (Single Page Application);
    removeAllChildrenFrom(recordsContainer);

    // getting the current query text
    let query = searchBar.value.trim();

    // if the length is greater than zero (inputted data) and the query isn't the same.
    
    if (query.length > 0) {
        // making a request to the api 
        makeRequest(query);
    }
});

// when in mobile, I have decided to make the categories overflow with a scroll bar, this is to help move it along more smoothly.
categoriesNode.addEventListener("wheel", function(event) {
    event.preventDefault();
    this.scrollLeft += (event.deltaY * 15);
});

categoriesNode.addEventListener('click', function(e) {
    // if a button is clicked, hide all dropdowns and show current selected dropdown contents.
    if(e.target.matches('.dropdown-btn')) {
        hideAllDropdowns();
        // making the current selected dropdown to be showable.
        const parent = e.target.parentNode.querySelector('.dropdown-content');
              parent.classList.toggle('show');
    }
});

window.addEventListener('click', function(event) {
    // if we click outside of the dropdown we want to hide all dropdowns.
    if (!event.target.matches('.dropdown-btn')) {
        hideAllDropdowns();
    }
});

