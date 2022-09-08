var Model = function () {
  var formValid;

  var attributes = {
    firstName: {},
    lastName: {},
    email: {},
    phone: {},
  };

  Object.observe(attributes, function (changes) {
    var atts = changes[0].object;
    for (var key in atts) {
      if (!atts[key].isValid) {
        return (formValid = false);
      }
    }
    formValid = true;
  });

  return {
    attributes: attributes,
    formValid: function () {
      return formValid;
    },
  };
};

var validators = {
  required: function (value) {
    return value.length === 0 ? false : true;
  },
  minLength: function (value) {
    return value.length < 2 ? false : true;
  },
  email: function (value) {
    return value.indexOf("@") === -1 ? false : true;
  },
  number: function (value) {
    return parseInt(value) ? true : false;
  },
  phone: function (value) {
    return value.length < 10 ? false : true;
  },
};

var validation = {
  firstName: [
    {
      required: "Whats your first name?",
    },
  ],
  lastName: [
    {
      required: "Whats your last name?",
    },
  ],
  email: [
    {
      required: "Whats your email?",
      email: "This isn't a valid email field",
    },
  ],
  phone: [
    {
      required: "Whats your phone number?",
      number: "This doesn't apear to be a number",
      phone: "This should be at least 10 digits",
    },
  ],
};

/* Form validation
 ************************************************************ */
function Form(model, options) {
  Object.observe(model.attributes, validateForm);

  if (options.debugging) {
    Object.observe(model.attributes, debugging);
  }

  function validateField(target) {
    var patterns = validation[target.name],
      isValid;

    function validate(rules) {
      for (var key in rules) {
        if (!validators[key](target.value)) {
          return rules[key];
        }
      }
      return true;
    }

    isValid = validate(patterns[0]);
    if (isValid.length) {
      return (model.attributes[target.name] = {
        isValid: false,
        value: isValid,
      });
    }

    model.attributes[target.name] = {
      isValid: true,
      value: target.value,
    };
  }

  function attachListeners($group) {
    $group.querySelector("input").addEventListener("blur", function (event) {
      validateField(event.target);
    });
  }

  function validateForm(changes) {
    function toggleStage($group, $label, changed) {
      $group.setAttribute(
        "class",
        model.attributes[changed.name].isValid ? "group valid" : "group invalid"
      );
      if (!model.attributes[changed.name].isValid) {
        $label.innerHTML = model.attributes[changed.name].value;
      } else {
        $label.innerHTML = "";
      }
    }

    changes.forEach(function (changed) {
      var $group = options.el[changed.name].parentNode,
        $label = $group.querySelector(".message");

      toggleStage($group, $label, changed);
    });
  }

  function debugging(changes) {
    options.ul.innerHTML = "";
    var documentFragment = document.createDocumentFragment(),
      li;

    for (var key in model.attributes) {
      if (model.attributes[key].isValid) {
        li = document.createElement("li");
        li.innerHTML = "{" + key + " : " + model.attributes[key].value + "}";
        documentFragment.appendChild(li);
      }
    }

    options.ul.appendChild(documentFragment);
  }

  var $groups = options.el.querySelectorAll(".group");
  for (var i = 0; i < $groups.length; i++) {
    attachListeners($groups[i]);
  }

  options.el.addEventListener("submit", function (event) {
    event.preventDefault();
    if (model.formValid()) {
      options.el.innerHTML =
        "<h2>Form submitted</h2><p><strong>Thanks for registering " +
        model.attributes.firstName.value +
        "!</strong></p> <p>We'll be sending you an email to <strong>" +
        model.attributes.email.value +
        "</strong> regarding activating your account.</p>";
    } else {
      for (var key in model.attributes) {
        if (model.attributes[key]) {
          validateField(options.el[key]);
        }
      }
    }
  });
}

$(function () {
  new Form(new Model(), {
    el: document.querySelector(".personal-details"),
    ul: document.querySelector(".debugging"),
    debugging: true,
  });
});
