
const config = {
    rootMargin: '0px 0px 50px 0px',
    threshold: 0
};

function preloadImage(target) {
    
    let container = target.parentNode;
    let recordImage = container.querySelector('img.recordImage');
    let progressBar = container.querySelector('.progressBar');

    if(container && recordImage && progressBar) {
        const xmlHTTP = new XMLHttpRequest();
        xmlHTTP.open("GET", recordImage.dataset.src, true);
        xmlHTTP.responseType = "arraybuffer";

        xmlHTTP.addEventListener('load', function () {
            const blob = new Blob([this.response]);
            recordImage.src = window.URL.createObjectURL(blob);
        });

        xmlHTTP.addEventListener('progress', function (e) {
            recordImage.completePercentage = parseInt((e.loaded / e.total) * 100);
            if (recordImage.completePercentage !== 100) {
                progressBar.style.width = `${recordImage.completePercentage}%`;
            } else {
                try {
                    container.removeChild(progressBar);
                } catch (e) {
                    console.log(e);
                }
            }
        });

        xmlHTTP.addEventListener('loadstart', function () {
            recordImage.completePercentage = 0;
        });

        xmlHTTP.addEventListener('error', function () {
            this.abort();
        });

        xmlHTTP.send();
    }
}

// register the config object with an instance
// of intersectionObserver
var observer = new IntersectionObserver(function (entries, self) {
    // iterate over each entry
    entries.forEach(entry => {
        // process just the images that are intersecting.
        // isIntersecting is a property exposed by the interface
        if (entry.isIntersecting) {
            // custom function that copies the path to the img
            // from data-src to src
            preloadImage(entry.target);
            // the image is now in place, stop watching
            self.unobserve(entry.target);
        }
    });
}, config);

function createFrontPanel(lowResSource, highResSource, altTags) {

    const container = document.createElement('div');
    container.addClass('front');

    const recordImage = createImage(lowResSource, highResSource, altTags);
    
    observer.observe(recordImage);
    recordImage.addEventListener('error', function () {
        observer.unobserve(this);
        this.src = './assets/images/404_ds.jpg';
    });

    const cover = document.createElement('div');
    cover.addClass('cover');

    const progressBar = document.createElement('div');
    progressBar.addClass('progressBar');

    container.append(recordImage, cover, progressBar);

    return container;
}

/**
 * @param {string} lowResSource a link to the low resolution image you want to load
 * @param {string} highResSource a link to the high resolution image you want to load
 * @param {string} altTags the altTags you want to provide for the image.
 * @returns {HTMLImageElement}
 */
function createImage(lowResSource, highResSource, altTags) {
    const recordImage = document.createElement('img');
    recordImage.src = lowResSource;
    recordImage.dataset.src = highResSource;
    recordImage.addClass('recordImage');
    recordImage.alt = altTags;
    recordImage.tabIndex = 0;

    return recordImage;
}


// creating the back panel which containers all the information when hovering
function createBackPanel(data) {
    const container = document.createElement('div');
    container.addClass('back');

    const categories = document.createElement('div');
    categories.addClass('categories');
    
    const contentContainer = document.createElement('div');
    contentContainer.addClass('content');

    if('place' in data && data.place !== "") {
        const category = document.createElement('h4');
        category.textContent = data.place;
        categories.appendChild(category);
    }

    contentContainer.appendChild(categories);

    if('title' in data && data.title !== "") {
        const title = document.createElement('h3');
        title.addClass('title');
        title.textContent = data.title;
        contentContainer.appendChild(title);
    }
    
    const viewSourceLink = document.createElement('a');
    viewSourceLink.href = '#';
    viewSourceLink.addClass('source');

    if('object_number' in data) {
        viewSourceLink.target = '_blank';
        viewSourceLink.href = `https://collections.vam.ac.uk/item/${data.object_number}`;
        viewSourceLink.textContent = 'view source';
    }

    if('object' in data && data.object !== "") {
        const object = document.createElement('p');
        object.textContent = `Type: ${data.object}`;
        contentContainer.appendChild(object);

    }

    if('location' in data && data.location !== "") {
        const location = document.createElement('p');
        location.textContent = `Location: ${data.location}`;
        contentContainer.appendChild(location);
    }

    if('artist' in data) {
        const artist = document.createElement('p');
        artist.textContent = `By ${data.artist}`;
        contentContainer.appendChild(artist);
    }

    if('date_text' in data && data.date_text !== "") {
        const date_text = document.createElement('p');
        date_text.textContent = `Made: ${data.date_text}`;
        contentContainer.appendChild(date_text);
    }

    contentContainer.appendChild(viewSourceLink);

    container.appendChild(contentContainer);
    return container;
}

/**
 * returns true if the device is a touch device
 * @returns {boolean} 
 */
function isTouchDevice() {
    return (('ontouchstart' in window) ||
       (navigator.maxTouchPoints > 0) ||
       (navigator.msMaxTouchPoints > 0));
}

/**
 * @param {*} data the data you want used for the alt tags
 * @returns  {string}
 */
function generateAltTags(data) {
    let generatedAltTagString = "";
    
    if('object' in data && data.object.trim() !== "") {
        generatedAltTagString += `object type: ${data.object};`;
    }

    if('place' in data && data.place.trim() !== "") {
        generatedAltTagString += `found in ${data.place};`;
    }

    if('title' in data && data.title.trim() !== "") {
        generatedAltTagString += `titled ${data.title};`;
    }

    if('location' in data && data.location.trim() !== "") {
        generatedAltTagString += `current location: ${data.location};`;
    }

    if('artist' in data) {
        generatedAltTagString += `made by: ${data.artist};`;
    }

    if('date_text' in data && data.date_text.trim() !== "") {
        generatedAltTagString += `created: ${data.date_text};`;
    }

    return generatedAltTagString;
}

/**
 * creates a new record element to append to the screen!
 * @param {*} data the record data you want to provide 
 * @returns {HTMLElement}
 */
function Record(data) {

    // creating a container which 
    const container = document.createElement("div");
    container.addClass("record", "active");

    if (data.place !== "") {
        container.dataset.category = encodeURI(data.place.toLowerCase().trim());
    }

    const imageURL = `https://media.vam.ac.uk/media/thira/collection_images/${data.primary_image_id.substring(0, 6)}/${data.primary_image_id}`;
    const frontPanel = createFrontPanel(
        `${imageURL}_jpg_s.jpg`, 
        `${imageURL}_jpg_ds.jpg`,
        generateAltTags(data)
        );
    const backPanel = createBackPanel(data);

    // adding an eventlistner to the container, this is for mobile only (even though there is a bug with the pointer event where you can click the link but on emulation it's fine??)
    container.addEventListener('click', function() {
        if(isTouchDevice()) {
            let lastElement = document.querySelector('.record[data-istouched="true"]');
            
            if(lastElement == this) {
                removePreviousSelectedRecord();
            } else {
                if(lastElement) {
                    lastElement.dataset.istouched = false;
                }
               container.dataset.istouched = true;
            }
        }
    });

    container.append(frontPanel, backPanel);
    return container;
}