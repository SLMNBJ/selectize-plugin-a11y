const eventHandler = function (name) {
  return function () {
    $('#log').append('<div><span class="name">' + name + '</span></div>');
  };
};

Selectize.define('selectize-plugin-a11y', function (options) {
  var self = this;

  if (typeof self.accessibility === "undefined") {
    self.accessibility = {};
  }

  self.accessibility.helpers = {
    randomId: function (len) {
      var str = "",
        strLength = len || 10,
        base = "abcdefghijklmnopqrstuvwxyz0123456789",
        baseLength = base.length;

      for (var i = 0; i < strLength; i++) {
        str += base[Math.floor(baseLength * Math.random())];
      }

      return str;
    }
  };

  self.accessibility.liveRegion = {
    $region: "",
    speak: function (msg) {
      var $msg = $("<div>" + msg + "</div>");
      this.$region.html($msg);
    },
    setAttributes: function () {
      this.$region.attr({
        "aria-live": "assertive",
        role: "log",
        "aria-relevant": "additions",
        "aria-atomic": "true"
      });
      self.$dropdown.attr({
        'aria-hidden': true,
        'tabindex': '-1',
        inert: true
      })
    },
    setStyles: function () {
      this.$region.css({
        position: "absolute",
        width: "1px",
        height: "1px",
        "margin-top": "-1px",
        clip: "rect(1px, 1px, 1px, 1px)",
        overflow: "hidden"
      });
    },
    init: function () {
      this.$region = $("<div>");
      this.setAttributes();
      this.setStyles();
      $("body").append(this.$region);
    }
  };

  self.onNavigation = function (currentValue) {
    self.accessibility.liveRegion.speak(currentValue);
  };

  self.open = (function (original) {
    return function () {
      original.apply(this, arguments);
      self.$control_input.attr("aria-expanded", "true");

    };
  })(self.open);

  self.close = (function (original) {
    return function () {
      original.apply(this, arguments);
      self.$control_input.attr("aria-expanded", "false");
      self.$control_input.removeAttr("aria-activedescendant");
    };
  })(self.close);

  self.onKeyDown = (function (original) {
    return function (e) {
      original.apply(this, arguments);
      if (e.keyCode !== 13 && e.keyCode !== 9 && e.keyCode !== 16) {
        self.trigger('navigation', self.$activeOption.text())
        self.$control_input.attr({
          "aria-activedescendant": self.$activeOption.text()
        });
      }
    };
  })(self.onKeyDown);


  if (self.settings['onNavigation']) {
    var handler = self.settings['onNavigation'];
    self.on('navigation', (currentValue, e) => {
      handler(self, currentValue);
      self.onNavigation(currentValue, e);
    });

    self.on('item_add', (selectedValue, $selectedItem) => {

      self.accessibility.liveRegion.speak(`${$selectedItem.text()} ${options.labels.selected}`);
    });

    self.on('item_remove', (selectedValue, $selectedItem) => {

      self.accessibility.liveRegion.speak(`${$selectedItem.text()} ${options.labels.removed}`);
    });

    self.on('focus', () => {
      var msg = `${self.items.length} ${options.labels.selectedOnfocus}: ${self.items.map(item => self.options[item].text).join(' ')}`
      self.accessibility.liveRegion.speak(msg);

    });

  }

  let customOpen = function () {

    if (options.customOpen) {
      let customOpenKeys = options.customOpenKeys,
        customCloseKeys = options.customCloseKeys,
        flag = false;

      self.$control.on("keydown", function (e) {
        if (customOpenKeys.includes(e.keyCode.toString()) && !flag) {
          self.open();
          flag = true;
        } else if (customCloseKeys.includes(e.keyCode.toString()) && flag) {
          self.close();
          flag = false;
        }
      });
    }
  }

  this.setup = (function () {
    var original = self.setup;
    return function () {
      original.apply(this, arguments);
      var listboxId = self.accessibility.helpers.randomId();



      self.$control_input.attr({
        role: "combobox",
        "aria-expanded": "false",
        haspopup: "listbox",
        "aria-owns": listboxId,
        "aria-label": self.$wrapper
          .closest("[data-accessibility-selectize-label]")
          .attr("data-accessibility-selectize-label")
      });

      self.$dropdown_content.attr({
        role: "listbox",
        id: listboxId
      });
      customOpen();

      self.accessibility.liveRegion.init();
    };
  })();
});


var $select = $('#select-state').selectize({
  createOnBlur: true,
  openOnFocus: false,
  plugins: {
    'selectize-plugin-a11y': {
      customOpen: true,
      customOpenKeys: ['13', '5', '40'],
      customCloseKeys: ['13'],
      labels: {
        selected: 'selected',
        selectedOnfocus: 'items selected',
        removed: 'removed'
      }
    }
  },
  render: {
    option: (item) => {
      return "<div class=option data-selectable data-value=" + item.value + "><input type=checkbox class=hidden />" + item.text + "</div>";
    }
  },
  onChange: eventHandler('onChange'),
  onItemAdd: eventHandler('onItemAdd'),
  onItemRemove: eventHandler('onItemRemove'),
  onOptionAdd: eventHandler('onOptionAdd'),
  onOptionRemove: eventHandler('onOptionRemove'),
  onDropdownOpen: eventHandler('onDropdownOpen'),
  onDropdownClose: eventHandler('onDropdownClose'),
  onFocus: eventHandler('onFocus'),
  onBlur: eventHandler('onBlur'),
  // New custom event
  onNavigation: eventHandler('onNavigation')
});