
/**
 * @param {string} classSelector the css selector you want to from the object.
 */
HTMLElement.prototype.removeClass = function(classSelector) {
    this.classList.remove(classSelector);
}


/**
 * @param {string[]} classSelectors the css selectors you want to from the object.
 */
HTMLElement.prototype.addClass = function(...classSelectors) {
    this.classList.add(...classSelectors);
}

/**
 * @param {string} classSelector the css selector you want to toggle.
 */
HTMLElement.prototype.toggleClass = function(classSelector) {
    this.classList.toggle(classSelector);
}

/**
 * @param {string} classSelector the css selector you want to check the existence of.
 * @returns {boolean}
 */
HTMLElement.prototype.containsClass = function(classSelector) {
    return this.classList.contains(classSelector);
}