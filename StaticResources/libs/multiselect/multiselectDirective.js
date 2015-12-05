/*https://gitlab.maikel.pro/maikeldus/WhatsSpy-Public/blob/01e2f83484f85256678c015c4903181f2fd3a5ed/js/vendor/angular-bootstrap-multiselect.js*/
angular.module('ui.multiselect', ['ngSanitize','ui.select'])
 //from bootstrap-ui typeahead parser
  .factory('optionParser', ['$parse', function ($parse) {
    //                      00000111000000000000022200000000000000003333333333333330000000000044000
    var TYPEAHEAD_REGEXP = /^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/;

    return {
      parse: function (input) {

        var match = input.match(TYPEAHEAD_REGEXP), modelMapper, viewMapper, source;
        if (!match) {
          throw new Error(
            "Expected typeahead specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_'" +
              " but got '" + input + "'.");
        }
        return {
          itemName: match[3],
          source: $parse(match[4]),
          viewMapper: $parse(match[2] || match[1]),
          modelMapper: $parse(match[1])
        };
      }
    };
  }])
.directive('multiselect', ['$parse', '$document', '$compile', 'optionParser',  function ($parse, $document, $compile, optionParser) {
      return {
        restrict: 'E',
        require: 'ngModel',
        link: function (originalScope, element, attrs, modelCtrl) {
            
            	var exp = attrs.options;
				var parsedResult = optionParser.parse(exp);
				var isMultiple = attrs.multiple ? true : false;
				var compareByKey = attrs.compareBy;
				var scrollAfterRows = attrs.scrollAfterRows;
				var required = false;
				var scope = originalScope.$new();
				scope.changeHandler = attrs.change || angular.noop;

			
               /* the items in the deirective :lable, model (object from server), checked */
              scope.items = [];
              scope.executedHandler = false;
              scope.bSelectAllItems = {value:true};
              scope.header = 'Select';
              scope.multiple = isMultiple;
              scope.disabled = false;
    
              originalScope.$on('$destroy', function () {
                scope.$destroy();
              });

              var popUpEl = angular.element('<multiselect-popup></multiselect-popup>');
    
              //required validator
              if (attrs.required || attrs.ngRequired) {
                    required = true;
              }
              attrs.$observe('required', function(newVal) {
                    required = newVal;
              });
             
             /***** ***** NOT USED *****  ********/ 
              //watch disabled state 
              scope.$watch(function () {
                 return $parse(attrs.disabled)(originalScope);
              }, function (newVal) {
                  scope.disabled = newVal;
              });
    
              //watch single/multiple state for dynamically change single to multiple
              scope.$watch(function () {
                return $parse(attrs.multiple)(originalScope);
              }, function (newVal) {
                  isMultiple = newVal || false;
              });
    
              //watch option changes for options that are populated dynamically
              scope.$watch(function () {
                return parsedResult.source(originalScope);
              }, function (newVal) {
                if (angular.isDefined(newVal))
                     parseModel();
                    
              }, true);
             /***** *************** ***/ 
            
              //watch model change  
              scope.$watch(function () {
                     return modelCtrl.$modelValue;
              }, function (newVal, oldVal) {
                    //when directive initialize, newVal usually undefined. Also, if model value already set in the controller
                    //for preselected list then we need to mark checked in our scope item. But we don't want to do this every time
                    //model changes. We need to do this only if it is done outside directive scope, from controller, for example.
                    if (angular.isDefined(newVal)) {
                         angular.forEach(scope.items, function (item) {
                            item.checked = false;
                         }); 
                         markChecked(newVal);
                         // scope.$eval(changeHandler);
                     }
                    getHeaderText();

                    
                    modelCtrl.$setValidity('required', scope.valid());
              }, true);

          /*    
          *    INIT DATA  scope.items filed with options from server
          *     item.model = holds org data from server 
          */
          function parseModel() {
                scope.items.length = 0;
                var ServerModel = parsedResult.source(originalScope);
                if(!angular.isDefined(ServerModel)) return;
                var tmp = [];
                for (var i = 0; i < ServerModel.length; i++) {
                      var local = {};
                      local[parsedResult.itemName] = ServerModel[i].label ;
                      var obj = {
                            label: parsedResult.viewMapper(local),
                            model: ServerModel[i],
                            Id: ServerModel[i].Id,
                            checked:true
                     };
                     tmp.push(obj);
                     //scope.items.push(obj);
                }
                scope.items = scope.items.concat(tmp);
          }
 
          parseModel();
          getHeaderText();
          
          element.append($compile(popUpEl)(scope));
         
          scope.checkDisabled = function(){
            return modelCtrl.$modelValue.length === 0;
          }
          
         //* DISPLAY TEXT  *//
          function getHeaderText() {
            
            if (is_empty(modelCtrl.$modelValue)) { scope.header = 'Select'; return;}
            if (isMultiple) {
                 
                   /* TODO if all selected display ALL else display selected*/
                   if(scope.items.length == modelCtrl.$modelValue.length) { //0 0 
                        if(modelCtrl.$modelValue.length == 1){
                              scope.header = modelCtrl.$modelValue[0].label;
                        }else{
                          scope.header =   'ALL' ;
                        }
                        scope.bSelectAllItems.value =  true ;

                    }
                    else {
                         scope.bSelectAllItems.value =  false ;
                        if(modelCtrl.$modelValue.length == 1){
                              scope.header = modelCtrl.$modelValue[0].label;
                        }else{
                             scope.header =   modelCtrl.$modelValue.length + ' ' + 'selected';
                        }
                    }
             
            } else {
                  var local = {};
                  local[parsedResult.itemName] = modelCtrl.$modelValue;
                  
                  scope.header = parsedResult.viewMapper(local);
            }
          }
          
          function is_empty(obj) {
                if (!obj) return true;
                if (obj.length && obj.length > 0) return false;
                for (var prop in obj) if (obj[prop]) return false;
                return true;
          }

          scope.valid = function validModel() {
                if(!required) return true;
                var value = modelCtrl.$modelValue;
                return (angular.isArray(value) && value.length > 0) || (!angular.isArray(value) && value != null);
          }

          function selectSingle(item) {
                if (item.checked) {
                        scope.uncheckAll();
                } else {
                      scope.uncheckAll();
                      item.checked = !item.checked;
                }
                scope.setModelValue(false);
          }

          function selectMultiple(item) {
                item.checked = !item.checked;
                scope.setModelValue(true);
          }
         /****   PASS THE SELECTED ITEMS TO PRESENTATION LEVEL   ****/
          scope.setModelValue = function(isMultiple) {
                var value;
                if (isMultiple) {
                      value = [];
                      for(var k = 0; k < scope.items.length; k++){
                            if (scope.items[k].checked){ value.push(scope.items[k].model);}
                      }
                } else {
                      angular.forEach(scope.items, function (item) {
                            if (item.checked) {
                                  value = item.model;
                                  return false;
                            }
                      })
                }
                modelCtrl.$setViewValue(value);
                getHeaderText();
          }

          function markChecked(newVal) {
                if (!angular.isArray(newVal)) {
                  angular.forEach(scope.items, function (item) {
                        if (angular.equals(item.model, newVal)) {
                              item.checked = true;
                              return false;
                        }
                  });
                } else {
                   // var tempindex = [];
                     for(var i = 0; i < newVal.length; i++){
                         
                          for(var k = 0; k < scope.items.length; k++){
                                if (angular.equals(scope.items[k].model, newVal[i])) {   
                                         //tempindex.push(k);
                                         scope.items[k].checked = true;
                                         continue;
                                }
                          }
                          
                     }
                 /*    if(tempindex.length == 0){
                         return;
                     }
                     for(var i=0; i<tempindex.length; i++){
                         var index = tempindex[i];
                         scope.items[index].checked = true;
                     }*/
                }
          }
          scope.toggleAllItemSelection = function () {
              if(scope.bSelectAllItems.value === true){
                   scope.checkAll();
              }else{
                  scope.uncheckAll();
              }
          };
          scope.checkAll = function () {
                if (!isMultiple) return;
                angular.forEach(scope.items, function (item) {
                    item.checked = true;
                });
                scope.setModelValue(true);
          };

          scope.uncheckAll = function () {
                angular.forEach(scope.items, function (item) {
                     item.checked = false;
                });
                scope.setModelValue(true);
          };

          scope.select = function (item,event) {
              event.stopPropagation();
                if (isMultiple === false) {
                     selectSingle(item);
                     scope.toggleSelect();
                } else {
                     selectMultiple(item);
                }
          }
        }
      };
    }])
  .directive('multiselectPopup', ['$document','$compile',  function ($document,$compile) {
    return {
          restrict: 'E',
    
          scope: false,
          replace: true,
          template: '<div class="dropdown">'+
                          '<button class="btn" ng-click="toggleSelect()" ng-disabled="disabled" ng-class="{\'error\': !valid()}">'+
                           ' <span class="pull-left">{{header}}</span>'+
                            '<span class="caret pull-right"></span>'+
                          '</button>'+
                          
                      '<div class="dropdown-menu">'+
                            ' <ul><li>'+
                                ' <input class="input-block-level multiSelectFilter" type="text" ng-model="searchText.label" autofocus="autofocus" placeholder="Filter" />'+
                            '</li>'+
                             '<li ng-show="multiple">'+
                                '<input type="checkbox"  ng-model="bSelectAllItems.value" class="multiToggle" ng-click="toggleAllItemSelection()"> Select all </input>'+
                             '</li>'+
                             '<li ng-repeat="i in items | filter:searchText">'+
                                '<a  title="{{i.label}}" ng-click="select(i,$event);">'+
                                    '  <input type="checkbox" ng-click="select(i,$event);" ng-checked="i.checked"></input>{{i.label}}</a>'+ 
                             ' </li>'+
                          '</ul>'
                          +'<div class="dropActionButtons">'
                                 +'<button class="btn  btn-xs pull-left"  ng-click="checkAll()"> Clear filter</button>'
                                 +'<button class="btn  btn-xs pull-right" ng-class= " {\'active\': !checkDisabled(), \'disabled\': checkDisabled()}" ng-disabled="checkDisabled()"  ng-click="submit()"> Apply</button>'
                          +'</div>'+
                    '</div>'+
                '</div>',
              link: function (scope, element, attrs,modelCtrl) {
                        scope.isVisible = false;
                        scope.backup = [];
                        scope.searchText = {label : ''};
                        
                        
                        scope.submit =  function(){
                            scope.searchText.label = '';
                           // scope.executedHandler  = true;
                          //   console.log('execute from apply button');
                            scope.$eval(scope.changeHandler);
                            scope.toggleSelect();
                        }
                        scope.toggleSelect = function () {
                                //this open bit only gets called if clicked on filter If clicked out of focus doesn't work
                              if (element.hasClass('open')) {
                                    element.removeClass('open');
                                    $document.unbind('click', scope.clickHandler);
                              } else {
                                    element.addClass('open');
                                    angular.copy(scope.items, scope.backup);
                                    $document.bind('click', scope.clickHandler);
                                    scope.focus();
                              }
                        };
                       var hasChecked = function(items){
                             for(var i = 0;i<items.length;i++){
                                 if(items[i].checked === true)
                                 return true;
                             }
                             return false;
                         }
                        scope.clickHandler = function(event) {
                              
                              if (elementMatchesAnyInArray(event.target, element.find(event.target.tagName))){
                                    return;
                              }
                                                                 
                             scope.searchText.label = '';
                             var itemsWereSelected = hasChecked(scope.items);
                              if(!itemsWereSelected){
                                 scope.items = scope.backup;
                              }
                              scope.setModelValue(true);
                              scope.backup = [];
                              element.removeClass('open');
                              $document.unbind('click', scope.clickHandler);
                             // if(itemsWereSelected && scope.executedHandler  === false){
                             if(itemsWereSelected ){
                                    scope.$eval(scope.changeHandler);
                                    //console.log('execute 2');
                              }
                             // scope.executedHandler  = false;
                              scope.$apply();
                        }
                        scope.focus = function focus(){
                              var searchBox = element.find('.multiSelectFilter');
                              searchBox.focus(); 
                        }
                        var elementMatchesAnyInArray = function (element, elementArray) {
                              for (var i = 0; i < elementArray.length; i++){
                                    if (element == elementArray[i]){
                                      return true;
                                    }
                              }
                              return false;
                        }
              }
    }
  }]);
