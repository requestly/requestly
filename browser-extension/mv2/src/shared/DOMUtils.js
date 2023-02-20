window.RQ = window.RQ || {};
RQ.DOMUtils = RQ.DOMUtils || {};

/**
 *
 * @param $el Element on which class should be toggled
 * @param className Class to be toggled
 * @param condition Boolean Condition - When true class will be added otherwise removed
 */
RQ.DOMUtils.toggleClass = function ($el, className, condition) {
  condition ? $el.addClass(className) : $el.removeClass(className);
};
