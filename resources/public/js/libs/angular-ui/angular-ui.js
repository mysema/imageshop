/**
 * AngularUI for AngularJS
 * v0.1.0
 * 
 * @link http://angular-ui.github.com/
 */

angular.module('ui.config', []).value('ui.config', {});
angular.module('ui.filters', ['ui.config']);
angular.module('ui.directives', ['ui.config']);
angular.module('ui', [
  'ui.filters', 
  'ui.directives',
  'ui.config'
]);
/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('ui.directives').directive('uiCodemirror', ['ui.config', '$parse', function (uiConfig, $parse) {
    uiConfig.codemirror = uiConfig.codemirror || {};
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ngModel) {
            // Only works on textareas
            if ( !elm.is('textarea') ) {
                throw Error('ui-codemirror can only be applied to a textarea element');
            }

            var codemirror;
            // This is the method that we use to get the value of the ui-codemirror attribute expression.
            var uiCodemirrorGet = $parse(attrs.uiCodemirror);
            // This method will be called whenever the code mirror widget content changes
            var onChangeHandler =  function (ed) {
                // We only update the model if the value has changed - this helps get around a little problem where $render triggers a change despite already being inside a $apply loop.
                var newValue = ed.getValue();
                if ( newValue !== ngModel.$viewValue ) {
                    ngModel.$setViewValue(newValue);
                    scope.$apply();
                }
            };
            // Create and wire up a new code mirror widget (unwiring a previous one if necessary)
            var updateCodeMirror = function(options) {
                // Merge together the options from the uiConfig and the attribute itself with the onChange event above.
                options = angular.extend({}, options, uiConfig.codemirror);

                // We actually want to run both handlers if the user has provided their own onChange handler.
                var userOnChange = options.onChange;
                if ( userOnChange ) {
                    options.onChange = function(ed) {
                        onChangeHandler(ed);
                        userOnChange(ed);
                    };
                } else {
                    options.onChange = onChangeHandler;
                }

                // If there is a codemirror widget for this element already then we need to unwire if first
                if ( codemirror ) {
                    codemirror.toTextArea();
                }
                // Create the new codemirror widget
                codemirror = CodeMirror.fromTextArea(elm[0], options);
            };

            // Initialize the code mirror widget
            updateCodeMirror(uiCodemirrorGet());

            // Now watch to see if the codemirror attribute gets updated
            scope.$watch(uiCodemirrorGet, updateCodeMirror, true);

            // Override the ngModelController $render method, which is what gets called when the model is updated.
            // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
            ngModel.$render = function() {
                codemirror.setValue(ngModel.$viewValue);
            };
       }
    };
}]);
/*
 Gives the ability to style currency based on its sign.
*/
  angular.module('ui.directives').directive('uiCurrency', ['ui.config','currencyFilter' , function(uiConfig, currencyFilter) {
	  var options = {
	      pos: 'ui-currency-pos',
	      neg: 'ui-currency-neg',
	      zero: 'ui-currency-zero'
	};
	if (uiConfig.currency) {
		angular.extend(options, uiConfig.currency);
	}
    return {
      restrict: 'EAC',
      require: '?ngModel',
      link: function(scope, element, attrs, controller) {
        var opts, // instance-specific options
          renderview, 
          value;
      
        opts = angular.extend({}, options, scope.$eval(attrs.uiCurrency));
        
        renderview = function(viewvalue) {
          var num;
          num = viewvalue * 1;
          if (num > 0) {
            element.addClass(opts.pos);
          } else {
            element.removeClass(opts.pos);
          }
          if (num < 0) {
            element.addClass(opts.neg);
          } else {
            element.removeClass(opts.neg);
          }
          if (num === 0) {
            element.addClass(opts.zero);
          } else {
            element.removeClass(opts.zero);
          }
          if (viewvalue === '') {
            element.text('');
          } else {
            element.text(currencyFilter(num, opts.symbol));
          }
          return true;
        };
        value = '';
        if (controller != null) {
          controller.$render = function() {
            value = controller.$viewValue;
            element.val(value);
            renderview(value);
          };
        } else {
          if (attrs.num != null) {
            value = scope[attrs.num];
          }
          renderview(value);
        }
      }
    };
  }]);
// Generated by CoffeeScript 1.3.3
/*
 jQuery UI Datepicker plugin wrapper
 
 @param [ui-date] {object} Options to pass to $.fn.datepicker() merged onto ui.config
*/

angular.module('ui.directives').directive('uiDate', [
  'ui.config', function(uiConfig) {
    var options;
    options = {};
    if (uiConfig.date != null) {
      angular.extend(options, uiConfig.date);
    }
    return {
      require: '?ngModel',
      link: function(scope, element, attrs, controller) {
        var opts, originalRender, updateModel, usersOnSelectHandler;
        opts = angular.extend({}, options, scope.$eval(attrs.uiDate));
        /* If we have a controller (i.e. ngModelController) then wire it up
        */

        if (controller != null) {
          updateModel = function(value, picker) {
            return scope.$apply(function() {
              return controller.$setViewValue(element.datepicker("getDate"));
            });
          };
          if (opts.onSelect != null) {
            /* Caller has specified onSelect to call this as well as updating the model
            */

            usersOnSelectHandler = opts.onSelect;
            opts.onSelect = function(value, picker) {
              updateModel(value);
              return usersOnSelectHandler(value, picker);
            };
          } else {
            /* No onSelect already specified so just update the model
            */

            opts.onSelect = updateModel;
          }
          /* Update the date picker when the model changes
          */

          originalRender = controller.$render;
          controller.$render = function() {
            originalRender();
            return element.datepicker("setDate", controller.$viewValue);
          };
        }
        /* Create the datepicker widget
        */

        return element.datepicker(opts);
      }
    };
  }
]);

/**
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ui-event
 * 
 * @example <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * 
 * @param ui-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
angular.module('ui.directives').directive('uiEvent', ['$parse',
function($parse) {
	return function(scope, elm, attrs) {
		var events = scope.$eval(attrs.uiEvent);
		angular.forEach(events, function(uiEvent, eventName){
      var fn = $parse(uiEvent);
			elm.bind(eventName, function(evt) {
				scope.$apply(function() {
          fn(scope, {$event: evt})
        });
			});
		});
	};
}]);

/**
 * General-purpose jQuery wrapper. Simply pass the plugin name as the expression.
 * 
 * It is possible to specify a default set of parameters for each jQuery plugin.
 * Under the jq key, namespace each plugin by that which will be passed to ui-jq.
 * Unfortunately, at this time you can only pre-define the first parameter.
 * @example { jq : { datepicker : { showOn:'click' } } }
 * 
 * @param ui-jq {string} The $elm.[pluginName]() to call.
 * @param [ui-options] {mixed} Expression to be evaluated and passed as options to the function
 * 		Multiple parameters can be separated by commas
 * 
 * @example <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter">
 */
angular.module('ui.directives').directive('uiJq', ['ui.config', function(uiConfig) {
	var options = {};
	return {
		link: {
			post: function(scope, elm, attrs) {
				var evalOptions;
				if (uiConfig['jq'] && uiConfig['jq'][attrs.uiJq]) {
					if (angular.isObject(options) && angular.isObject(uiConfig['jq'][attrs.uiJq])) {
						angular.extend(options, uiConfig['jq'][attrs.uiJq]);
					} else {
						options = uiConfig['jq'][attrs.uiJq];
					}
				}
				if (attrs.uiOptions) {
					evalOptions = scope.$eval('['+attrs.uiOptions+']');
					if (angular.isObject(options) && angular.isObject(evalOptions[0])) {
						angular.extend(options, evalOptions[0]);
					} else {
						options = evalOptions[0];
					}
				}
				elm[attrs.uiJq](options);
			}
		}
	};
}]);

/**
 * Bind one or more handlers to particular keys or their combination
 * @param hash {mixed} keyBindings Can be an object or string where keybinding expression of keys or keys combinations and AngularJS Exspressions are set. Object syntax: "{ keys1: expression1 [, keys2: expression2 [ , ... ]]}". String syntax: ""expression1 on keys1 [ and expression2 on keys2 [ and ... ]]"". Expression is an AngularJS Expression, and key(s) are dash-separated combinations of keys and modifiers (one or many, if any. Order does not matter). Supported modifiers are 'ctrl', 'shift', 'alt' and key can be used either via its keyCode (13 for Return) or name. Named keys are 'backspace', 'tab', 'enter', 'esc', 'space', 'pageup', 'pagedown', 'end', 'home', 'left', 'up', 'right', 'down', 'insert', 'delete'.
 * @example <input ui-keypress="{enter:'x = 1', 'ctrl-shift-space':'foo()', 'shift-13':'bar()'}" /> <input ui-keypress="foo = 2 on ctrl-13 and bar('hello') on shift-esc" />
 **/
angular.module('ui.directives').directive('uiKeypress', [function(){
  return {
    link: function(scope, elm, attrs) {
      var keysByCode = {
        8:  'backspace',
        9:  'tab',
        13: 'enter',
        27: 'esc',
        32: 'space',
        33: 'pageup',
        34: 'pagedown',
        35: 'end',
        36: 'home',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        45: 'insert',
        46: 'delete'
      };

      var params, paramsParsed, expression, keys, combinations = [];
      try {
        params = scope.$eval(attrs.uiKeypress);
        paramsParsed = true;
      } catch (error) {
        params = attrs.uiKeypress.split(/\s+and\s+/i);
        paramsParsed = false;
      }

      // Prepare combinations for simple checking
      angular.forEach(params, function(v, k) {
        var combination = {};
        if(paramsParsed) {
          // An object passed
          combination.expression = v;
          combination.keys = k;
        } else {
          // A string passed
          v = v.split(/\s+on\s+/i);
          combination.expression = v[0];
          combination.keys = v[1];
        }
        combination.keys = combination.keys.split('-');
        combinations.push(combination);
      });

      // Check only mathcing of pressed keys one of the conditions
      elm.bind('keydown', function(event) {
        // No need to do that inside the cycle
        var altPressed   = event.metaKey || event.altKey;
        var ctrlPressed  = event.ctrlKey;
        var shiftPressed = event.shiftKey;

        // Iterate over prepared combinations
        angular.forEach(combinations, function(combination) {
          var mainKeyPressed = combination.keys.indexOf( keysByCode[event.keyCode] ) > -1 || combination.keys.indexOf( event.keyCode.toString() ) > -1

          var altRequired   =  combination.keys.indexOf('alt')   > -1;
          var ctrlRequired  =  combination.keys.indexOf('ctrl')  > -1;
          var shiftRequired =  combination.keys.indexOf('shift') > -1;

          if( mainKeyPressed &&
              ( altRequired   == altPressed   ) &&
              ( ctrlRequired  == ctrlPressed  ) &&
              ( shiftRequired == shiftPressed )
            ) {
            // Run the function
            scope.$apply(combination.expression, { '$event' : event });
          }
        });
      });
    }
  };
}]);
// Generated by CoffeeScript 1.3.3
/*
 Attaches jquery-ui input mask onto input element
*/

angular.module('ui.directives').directive('uiMask', [
  function() {
    return {
      require: 'ngModel',
      scope: {
        uiMask: '='
      },
      link: function($scope, element, attrs, controller) {
        /* We override the render method to run the jQuery mask plugin
        */
        controller.$render = function() {
          var value;
          value = controller.$viewValue || '';
          element.val(value);
          return element.mask($scope.uiMask);
        };
        /* Add a parser that extracts the masked value into the model but only if the mask is valid
        */

        controller.$parsers.push(function(value) {
          var isValid;
          isValid = element.data('mask-isvalid');
          controller.$setValidity('mask', isValid);
          return element.mask();
        });
        /* When keyup, update the viewvalue
        */

        return element.bind('keyup', function() {
          return $scope.$apply(function() {
            return controller.$setViewValue(element.mask());
          });
        });
      }
    };
  }
]);

angular.module('ui.directives')
.directive('uiModal', ['$timeout', function($timeout) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, model) {
      //helper so you don't have to type class="modal hide"
      elm.addClass('modal hide'); 
      scope.$watch(attrs.ngModel, function(value) {
          elm.modal(value && 'show' || 'hide');
      });
      elm.on('show.ui', function() {
		$timeout(function() {
    		 model.$setViewValue(true);
    	});
      });
      elm.on('hide.ui', function() {
        $timeout(function() {
        	model.$setViewValue(false);
        });
      });
    }
  };
}]);

/**
 * Actually removes html from the DOM instead of hiding it for assistance with 
 * CSS3 selectors such as :first-child, :last-child, etc
 * 
 * NOTE: This solution may not behave perfectly when used with or around other directives that also
 *   manipulate the dom.
 * 
 * @todo Add a more resilient solution to injecting removed elements back into the DOM (instead of relying on nextElm)
 * @param remove {boolean} condition to check if the element should be removed form the DOM
 */
angular.module('ui.directives').directive('uiRemove', [function() {
	return {
		link: function(scope, elm, attrs) {
			var parent = elm.parent();
			var expression = attrs.uiRemove;
			elm.data('ui-remove-index', elm.index());
			scope.$watch(expression, function(newValue, oldvalue) {
				var index, children, child;
				if (newValue) {
					elm.detach(); 
				} else if (!$.contains(parent, elm)) {
					index = elm.data('ui-remove-index');
					children = elm.parent().children();
					if (children.length > 0) {
						for (var i = 0; i < children.length; i++) {
							child = children[i];
							if (index > child.index() && i === children.length-1) {
								child.after(elm);
							} else {
								child.before(elm);
							}
						}
					} else {
						parent.append(elm);
					}
				}
			});
		}
	};
}]);

/**
 * Add a clear button to form inputs to reset their value
 */
angular.module('ui.directives').directive('uiReset', ['$parse', function($parse) {
	return function(scope, elm, attrs) {
		if (!attrs.ngModel) {
			throw Error('ui-reset depends on ng-model');
		}
		elm.wrap('<span class="ui-resetwrap" />').after('<a class="ui-reset" />').next().click(function(e){
			e.preventDefault();
			// This object is a 'parsed' version of the model
			var ngModel = $parse(attrs.ngModel);
			// This lets you SET the value of the 'parsed' model
			ngModel.assign(scope, null);
			scope.$apply();
		});
	};
}]);

/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
angular.module('ui.directives').directive('uiScrollfix', [function() {
	return {
		link: function(scope, elm, attrs) {
			var top = elm.offset().top;
			if (!attrs.uiScrollfix) {
				attrs.uiScrollfix = top;
			} else {
				if (attrs.uiScrollfix.indexOf('-') === 0) {
					attrs.uiScrollfix = top - attrs.uiScrollfix.substr(1);
				} else if (attrs.uiScrollfix.indexOf('+') === 0) {
					attrs.uiScrollfix = top + parseInt(attrs.uiScrollfix.substr(1));
				}
			}
			$(window).bind('scroll.ui-scrollfix', function(){
				if (!elm.hasClass('ui-scrollfix') && window.pageYOffset > attrs.uiScrollfix) {
					elm.addClass('ui-scrollfix');
				} else if (elm.hasClass('ui-scrollfix') && window.pageYOffset < attrs.uiScrollfix) {
					elm.removeClass('ui-scrollfix');
				}
			});
		}
	};
}]);

/**
 * Enhanced Select2 Dropmenus
 *
 * @concerns When the plugin loads, it injects an extra DIV into the DOM below itself. This disrupts the
 *   compiler, breaking everything below. Because of this, it must be initialized asynchronously (late).
 *   Since the ng:model and ng:options/ng:repeat can be populated by AJAX, they must be monitored in order
 *   to refresh the plugin so that it reflects the selected value
 * @AJAX Multiselect - For these, you must use an <input>. The values will NOT be in the form of an Array,
 *   but a comma-separated list. You must adjust the value as needed before using accordingly
 * @params [options] {object} The configuration options passed to $().select2(). Refer to the documentation
 *   - [watch] {string} an expression to monitor for changes. For use with ng:repeat populated via ajax
 *   - [ajax.initial] {function(url, values, multiple)} a callback function that returns the query string
 *   		to retrieve initial information about preselected/default values
 */
angular.module('ui.directives').directive('uiSelect2', ['ui.config', '$http', function(uiConfig, $http){
	var options = {};
	if (uiConfig.select2) {
		angular.extend(options, uiConfig.select2);
	}
	return {
		require: '?ngModel',
		link: function(scope, elm, attrs, controller) {
		    // Indicates if the widget has been initialized atleast once or not. Please read default init above
			var init = true, 
				opts, // instance-specific options
				prevVal = '',
				loaded = false,
				multiple = false;
			
			if(typeof attrs.multiple !== 'undefined'){
			    multiple = true;
			}

			opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));
			
			if (!elm.is('select') && opts.ajax) {
				if(multiple){
					opts.multiple = true;
				}
				// Set the view and model value and update the angular template manually for the ajax/multiple select2.
				elm.bind("change", function(){
					controller.$setViewValue(elm.val());
					scope.$apply();
				});
			}

			function initialize(newVal) {
				setTimeout(function(){
					if (newVal !== undefined) {
						if (opts.ajax) {
							if (newVal && !$.isEmptyObject(newVal)) {
								if (init && opts.initial) {
									var url = opts.initial(opts.ajax.url, newVal, opts.multiple);
								    $http({ method: 'GET', url: url }).success(function(data, status, headers, config){
										data = opts.ajax.results(data);
										elm.select2('val', data.results || '');
									});
									init = false;
								}
							} else {
							    elm.select2('val', '');
							}
						} else {
							elm.select2('val', newVal);
						}
					}
				},0);
			}

			// Initialize the plugin late so that the injected DOM does not disrupt the template compiler
			// ToDo: $timeout service
			setTimeout(function(){
				elm.select2(opts);
				loaded = true;
				// If a watch was fired before initialized, set the init value
				initialize(prevVal);
			},0);

			// Watch the model for programmatic changes
			scope.$watch(attrs.ngModel, function(newVal, oldVal, scope) {
				if (newVal === prevVal) {
					return;
				}
				if (loaded) {
					initialize(newVal);
					if (!newVal) {
					    // Push the model change to the view(only the null value in this case)
					    elm.select2('val', '');
					}
				}
				prevVal = newVal;
			});
			// If you want you can watch the options dataset for changes
			if (angular.isString(opts.watch)) {
				scope.$watch(opts.watch, function(newVal, oldVal, scope){
					if (loaded && prevVal) {
						setTimeout(function(){
							elm.select2('val', prevVal);
						},0);
					}
				});
			}
		}
	};
}]);

/**
 * uiShow Directive
 *
 * Adds a 'ui-show' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
angular.module('ui.directives').directive('uiShow', [function() {
	return function(scope, elm, attrs) {
		scope.$watch(attrs.uiShow, function(newVal, oldVal){
			if (newVal) {
				elm.addClass('ui-show');
			} else {
				elm.removeClass('ui-show');
			}	
		});
	};
}])

/**
 * uiHide Directive
 *
 * Adds a 'ui-hide' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
.directive('uiHide', [function() {
	return function(scope, elm, attrs) {
		scope.$watch(attrs.uiHide, function(newVal, oldVal){
			if (newVal) {
				elm.addClass('ui-hide');
			} else {
				elm.removeClass('ui-hide');
			}
		});
	};
}])

/**
 * uiToggle Directive
 *
 * Adds a class 'ui-show' if true, and a 'ui-hide' if false to the element instead of display:block/display:none
 * Created to allow tighter control  of CSS without bulkier directives. This also allows you to override the
 * default visibility of the element using either class.
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
.directive('uiToggle', [function() {
	return function(scope, elm, attrs) {
		scope.$watch(attrs.uiToggle, function(newVal, oldVal){
			if (newVal) {
				elm.removeClass('ui-hide').addClass('ui-show');
			} else {
				elm.removeClass('ui-show').addClass('ui-hide');
			}
		});
	};
}]);

/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.directives').directive('uiTinymce', ['ui.config', function(uiConfig){
	uiConfig.tinymce = uiConfig.tinymce || {};
	return {
		require: 'ngModel',
		link: function(scope, elm, attrs, ngModel) {
			var expression,
			  options = {
				// Update model on button click
				onchange_callback: function(inst) {
					if (inst.isDirty()) {
						inst.save();
						ngModel.$setViewValue(elm.val());
                           scope.$apply();
					}
				},
				// Update model on keypress
				handle_event_callback: function(e) {
					if (this.isDirty()) {
						this.save();
						ngModel.$setViewValue(elm.val());
                           scope.$apply();
					}
					return true; // Continue handling
				},
				// Update model when calling setContent (such as from the source editor popup)
				setup : function(ed) {
					ed.onSetContent.add(function(ed, o) {
						if (ed.isDirty()) {
							ed.save();
							ngModel.$setViewValue(elm.val());
							scope.$apply();
						}
					});
				}
			};
			if (attrs.uiTinymce) {
				expression = scope.$eval(attrs.uiTinymce);
			} else {
				expression = {};
			}
			angular.extend(options, uiConfig.tinymce, expression);
			setTimeout(function(){
				elm.tinymce(options);
			});
		}
	};
}]);

/**
 * Adds a 'fixed' class to the element when the page scrolls past it's position.
 * @param expression {boolean} condition to check if it should be a link or not
 */
angular.module('ui.filters').filter('highlight', function() {
	return function(text, filter) {
		if (filter === undefined) {
			return text;
		} else {
			return text.replace(new RegExp(filter, 'gi'), '<span class="ui-match">$&</span>');
		}
	};
});

/**
 * Returns the length of the filtered object or array
 */
angular.module('ui.filters').filter('length', function() {
  return function(value) {
    var len = 0;
    if (typeof value.length == 'undefined') {
      for (key in value) len++;
      return len;
    }
    return value.length;
  };
});

/**
 * Converts variable-esque naming conventions to something presentational, capitalized words separated by space.
 * @param {String} value The value to be parsed and prettified.
 * @return {String}
 * @example {{ 'firstName' | prettify }} => First Name
 *          {{ 'last_name' | prettify }} => Last Name
 *          {{ 'home_phoneNumber' | prettify }} => Home Phone Number
 */
angular.module('ui.filters').
    filter('prettify', function () {
        return function (value) {
            return value
                //replace all _ and spaces and first characters in a word with upper case character
                .replace(/(?:_| |\b)(\w)/g, function(str, p1) { return p1.toUpperCase();})
                // insert a space between lower & upper
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                // space before last upper in a sequence followed by lower
                .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3');
        };
    });

/**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
	if the key is empty, the entire object will be compared
	if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('ui.filters').filter('unique', function() {
	return function(items, key) {
		if (key && angular.isArray(items)) {
			var hashCheck = {},
				newItems = [];
			angular.forEach(items, function(item, key){
				var value;
				if (angular.isString(key)) {
					value = item[key];
				} else {
					value = item;
				}
				if (hashCheck[value] === undefined) {
					hashCheck[value] = true;
					newItems.push(item);
				}
			});
			items = newItems;
		}
		return items;
	};
});
