if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt) {
    return jQuery.inArray(elt, this);
  };
}