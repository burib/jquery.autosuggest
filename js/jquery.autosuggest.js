/**
 * @author Balazs_Buri
 * jQuery autosuggest v1.0
 */
/*extern jQuery */
(function($) {
   $.autosuggest = function(form, options) {
        var $suggestFields,
            defaults = {
               minChars         : 2,                                   //minimum characters before search initialized                    || int ||
               delay            : 300,                                 //millisecond delays between each key typing                      || int ||
               resultsLimit     : -1,
               fieldsClass      : 'autosuggest',                       //searches for every elements that has this class                 || string ||
               wrapperClass     : 'suggestFieldCont',                  //wraps every autosuggest fields with this class                  || string ||
               wrapperPrefix    : 'suggestField',                      //wraps every autosuggest fields with this class                  || string ||
               loadingClass     : 'loading',                           //will add this class to autosuggestField while it's searching    || string ||
               highlightClass   : 'highlight',                         //will wrap the matched text with this class                      || string ||
               resultsClass     : 'resultsField',
               selectsClass     : 'selectsField',
               hoveredClass     : 'hovered',
               noResultText     : 'not found',                         //this text will be shown when there is no result found           || string ||
               removeClass      : 'remove',
               removeText       : '&times;',
               dataSource       : function () { return {}; }
            },
            plugin = this,
            $form = $(form);

      function registerEvents () {
         $.each($suggestFields, function() {
            var suggestField = $(this),
                wrapperField = suggestField.parents('.' + plugin.settings.wrapperClass),
                resultsField = wrapperField.find('.' + plugin.settings.resultsClass),
                selectsField = wrapperField.find('.' + plugin.settings.selectsClass),
                keyCode,
                keys = {
                   up    : 38,
                   down  : 40,
                   enter : 13,
                   esc   : 27
                };

           suggestField.bind('keydown', function (e) {
              keyCode = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
              switch(keyCode)
              {
              case keys.up:
                selectList.navigate('up', resultsField);
                break;
              case keys.down:
                selectList.navigate('down', resultsField);
                break;
              case keys.esc:
                selectList.hide(resultsField, e);
                break;
              case keys.enter:
                selectList.selectItem(wrapperField, resultsField, selectsField, null, e);
                break;
              default:
                autosuggest(e, suggestField);
              }
           }).bind('focus', function (e) {
             $suggestFields.find('.' + plugin.settings.resultsClass);
           });

           resultsField.on('li', 'click', function (e) {
              suggestField.trigger('focus');
              selectList.selectItem(wrapperField, resultsField, selectsField, this, e);
           }).on('li', 'hover', function () {
              selectList.navigate('hover', resultsField, null, $(this));
           });

           selectsField.on('span.'+plugin.settings.removeClass, 'click', function (e) {
              selectList.removeItem(wrapperField, resultsField, selectsField, $(this).parent(), e);
           });

         })


         $('body').bind('click', function (e) {
             var resultsField = $(e.target).parents('.' + plugin.settings.wrapperClass).find('.' + plugin.settings.resultsClass);
             selectList.hide($('.' + plugin.settings.resultsClass), e);
             if ( resultsField.length > 0 ) {
               selectList.show(resultsField, e);
             }
           });


      }

      function prepareSuggestFields() {
            var $this, // will be a local variable of each autosuggest field
                fieldId,
                isInput,
                isMultiSelect;

            $suggestFields = $form.find('.' + plugin.settings.fieldsClass); //finds the elements that the autosuggest has to be prepared on

            $suggestFields.each(function (index, value) {
                $this = $(value);
                fieldId = $this[0].id + index;
                isInput = $this[0].nodeName.toLowerCase() === "input";
                isMultiSelect = $this.prop('multiple');

                if ( !isInput ) {
                   $this.hide().wrap($('<span id="' + plugin.settings.wrapperPrefix + "_" + fieldId + '" class="' + plugin.settings.wrapperClass + '"></span>')).after($('<ul class="' + plugin.settings.selectsClass + '"></ul>')).after($('<ul class="' + plugin.settings.resultsClass + '"></ul>')).before($('<input class="' + plugin.settings.fieldsClass + '" autosuggest="false" multiselect="' + isMultiSelect + '" />'));
                }
                else {
                   $this.attr('autosuggest', false).wrap($('<span id="' + plugin.settings.wrapperPrefix + "_" + fieldId + '" class="' + plugin.settings.wrapperClass + '"></span>')).after($('<ul class="' + plugin.settings.selectsClass + '"></ul>')).after($('<ul class="' + plugin.settings.resultsClass + '"></ul>')).after($('<select name="' + $this.attr('name') + '" multiple="' + isMultiSelect + '"></select>').hide()).removeAttr('name');
                }
            });

          $suggestFields = $form.find('input.' + plugin.settings.fieldsClass); //finds the elements that the autosuggest has been been prepared
          registerEvents();
      };

      function autosuggest(e, item) {
        var query = $.trim(item.val()),
            timer = null;


        /*var dataSource = plugin.settings.dataSource();
        console.log( dataSource );
        */

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(function(){
            if (query.length > plugin.settings.minChars) {
              item.addClass(plugin.settings.loadingClass);

              var matchedResults = [
                {
                  "key" : "001",
                  "value" : "banana"
                },
                {
                  "key" : "002",
                  "value" : "apple"
                },
                {
                  "key" : "003",
                  "value" : "melon"
                }
              ];
              //datasource
              setSuggestList(matchedResults, item);
              item.removeClass(plugin.settings.loadingClass);

            }
        }, plugin.settings.delay);

      };

      function preg_quote(str){
          return (str + '').replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1");
      }

      function setSuggestList(results, item) {
        var isMultiSelect = item.prop('multiselect'),
            query = $.trim(item.val()),
            parentField = item.parents('.' + plugin.settings.wrapperClass),
            resultsField = parentField.find('.' + plugin.settings.resultsClass),
            selectsField = parentField.find('.' + plugin.settings.selectsClass),
            resultsIndex = 0,
            pattern = new RegExp(preg_quote(query), 'gi'),
            item;

        resultsField.empty();
        for (; resultsIndex < results.length; resultsIndex++) {
          if (plugin.settings.resultsLimit === -1 || resultsIndex < plugin.settings.resultsLimit ) {

            if (!!results[resultsIndex].value.match(pattern) ) {
              item = results[resultsIndex].value.replace(pattern, "<span class=\"" + plugin.settings.highlightClass + "\">$&</span>");
              resultsField.append($('<li data-key="' +results[resultsIndex].key+ '">' + item + '<span class="' + plugin.settings.removeClass + '">' + plugin.settings.removeText + '</span></li>'));
            }
          }
          else {
            return;
          }
        };
      }

      var selectList = {};
      selectList.navigate = function(actionType, resultsField, selectListField, hoveredListItem) {
        var hoveredListItem = hoveredListItem || resultsField.find('li.' + plugin.settings.hoveredClass),
            resultsFieldListItems = resultsField.find('li').removeClass(plugin.settings.hoveredClass);

        switch(actionType) {
          case 'up':
              hoveredListItem = hoveredListItem.prevAll(':visible').first();
              if (hoveredListItem.length > 0) {
                hoveredListItem.addClass(plugin.settings.hoveredClass);
              }
              else {
                resultsFieldListItems.last().addClass(plugin.settings.hoveredClass);
              }
            break;
          case 'down':
              hoveredListItem = hoveredListItem.nextAll(':visible').first();
              if (hoveredListItem.length > 0) {
                hoveredListItem.addClass(plugin.settings.hoveredClass);
              }
              else {
                resultsFieldListItems.first().addClass(plugin.settings.hoveredClass);
              }
            break;
          case 'hover':
            hoveredListItem.addClass(plugin.settings.hoveredClass);
            break;
          default:
            autosuggest(e, suggestField);
        }
      }
      selectList.selectItem = function (suggestField, resultsField, selectsField, hoveredListItem, e) {
        e.preventDefault();
        var hoveredListItem = $(hoveredListItem);
        if ( !(hoveredListItem.length > 0) ) {
          hoveredListItem = $(resultsField).find('li.' + plugin.settings.hoveredClass);
        }
        selectsField.append(hoveredListItem.clone().removeClass(plugin.settings.hoveredClass));
        hoveredListItem.hide();

        if (suggestField.find('input.' + plugin.settings.fieldsClass).prop('multiselect')) {
          suggestField.find('select').empty();
        }
        suggestField.find('select').append($('<option selected="selected" value="' + hoveredListItem.attr('data-key') + '">' + hoveredListItem.clone().find('span.'+plugin.settings.removeClass).remove().end().text() + '</option>'));
      }
      selectList.removeItem = function (suggestField, resultsField, selectsField, hoveredListItem, e) {
        e.preventDefault();
        resultsField.find('li[data-key="' + hoveredListItem.attr('data-key') + '"]').show();
        $(suggestField.find('option[value="' + hoveredListItem.attr('data-key') + '"]')).remove();
        hoveredListItem.remove();
      }
      selectList.show = function (resultsField, e) {
        resultsField.show();
      }
      selectList.hide = function (resultsField, e) {
        resultsField.hide();
      }


      plugin.init = function() {
         plugin.settings = $.extend({}, defaults, options);   //overwrite the default options
         prepareSuggestFields();
      }();
   };

   $.fn.autosuggest = function(options) {
      return this.each(function() {
         if (undefined === $(this).data('autosuggest')) {
            var plugin = new $.autosuggest(this, options);
            $(this).data('autosuggest', plugin);
         }
      });
   };
})(jQuery);