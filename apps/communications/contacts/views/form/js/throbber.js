(function(exports) {
  var throbberDOM = document.getElementById('throbber');
  exports.Throbber = {
    show: function() {
      throbberDOM.classList.remove('hide');
    },
    hide: function() {
      throbberDOM.classList.add('hide');
    }
  };
}(window));
