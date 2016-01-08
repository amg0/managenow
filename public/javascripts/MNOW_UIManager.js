//# sourceURL=MNOW_UIManager.js
// "use strict";
	
var DBModel = (function() {
	var _dictionary = {
		"projects":{
			"id": 				{type:'number', default:''},
			"project_name":		{type:'text', 	default:'' , required:true },
			"prod_date":		{type:'date', 	default:new Date().toISOString().substring(0, 10) , required:true },
			"project_manager":	{type:'reference', default:null, table:'users', field:'id', formatter:function(col,row) { 
					// if not null
					if (row.project_manager) {
						var usr = Entities.get("users",row.project_manager);
						return '{0},{1}'.format(usr.last_name,usr.first_name);
					}
					return "";
				}
			},
		},
		"users":{
			"id": 			{type:'number', default:''},
			"first_name":	{type:'text', 	default:''},
			"last_name":	{type:'text', 	default:'' , required:true },
			"email":		{type:'email', 	default:'' , required:true },
			"location":		{type:'text', 	default:''},
		}
	};

	return {
		getDictionary:function(type) {
			return _dictionary[type] || null;
		},
		
		getTemplate:function(type) {
			var dict = _dictionary[type];
			if (dict) {
				var obj = {};
				$.each(dict,function(k,v) {
					obj[k]=v.default;
				});
				return obj;
			}
			return null;
		},
		
		getAll:function(objtype, callback ) {
			return $.ajax({
			  url: '/api/'+objtype,
			  dataType: "json",
			  cache:false,
			  success: function (data) {
				  callback(data);
			  }
			});
		},
		
		get:function(objtype, id, callback ) {
			if (id) {
				$.ajax({
				  url: '/api/'+objtype+'/'+id.toString(),
				  type: 'GET',
				  cache:false,
				  success: function (data) {
					  callback(data);
				  }
				});
			}
		},

		update:function(objtype, object, callback ) {
			if (object.id) {
				$.ajax({
				  url: '/api/'+objtype+'/'+object.id.toString(),
				  type: 'PUT',
				  data: {
					  json:JSON.stringify(object)
				  },
				  cache:false,
				  success: function (data) {
					  callback(data);
				  }
				});
			}
		},
		
		add:function(objtype, object, callback ) {
			$.ajax({
			  url: '/api/'+objtype,
			  type: 'POST',
			  data: {
				json:JSON.stringify(object)
			  },
			  cache:false,
			  success: function (data) {
				  callback(data);
			  }
			});
		},
		
		del:function(objtype, id, callback ) {
			$.ajax({
			  url: '/api/'+objtype+'/'+id.toString(),
			  type: 'DELETE',
			  data: null,
			  cache:false,
			  success: function (data) {
				  callback(data);
			  }
			});
		},
	}
})();

var Entities = (function() {	
	var _cache={};
	
	function _init(type) {
		var dfd = new $.Deferred();
		delete _cache[type];
		_cache[type]={}
		DBModel.getAll(type,function(list) {
			_cache[type]=list;
			dfd.resolve(list);
		});
		return dfd.promise()
	};
	
	function _get(type,id) {
		if ((id>0) && (_cache[type]) ) {
			for (var i=0; i<_cache[type].length ; i++) {
				if (_cache[type][i].id == id ) {
					return _cache[type][i];
				}
			}
		}
		return null;
	}
	return {
		init : _init,
		get  : _get
	};
})();

if (typeof String.prototype.format == 'undefined') {
	String.prototype.format = function()
	{
		var args = new Array(arguments.length);
		for (var i = 0; i < args.length; ++i) {
		// `i` is always valid index in the arguments object
		// so we merely retrieve the value
		args[i] = arguments[i];
		}
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
};

// Put somewhere in your scripting environment
if (jQuery.when.all===undefined) {
    jQuery.when.all = function(deferreds) {
        var deferred = new jQuery.Deferred();
        $.when.apply(jQuery, deferreds).then(
            function() {
                deferred.resolve(Array.prototype.slice.call(arguments));
            },
            function() {
                deferred.fail(Array.prototype.slice.call(arguments));
            });

        return deferred;
    }
}

var HtmlUtils = (function() {
	function _buildItems(table,field,display,selectedvalue) {
		DBModel.getAll(table,function(list) {
			var i=0;
		});
		return [];
	};
	function _buildField(dictionary,key,value) {
		var dfd =  $.Deferred();
		switch (dictionary.type) {
			case "number":
				htmltype="number";
				htmlField = new EJS({url: '/views/ff_input.ejs'}).render({
						htmltype:"number",
						key:key,
						value:value,
						required:(dictionary.required || false), 
						placeholder:""
				});
				dfd.resolve(htmlField);
				break;
			case "date":
				// for pure date field, we do not want to take into account user locale. date is the date we want
				value = value.substring(0, 10);
				// var date = new Date(value);
				// value = date.toISOString().substring(0, 10);
				htmlField = new EJS({url: '/views/ff_input.ejs'}).render({
						htmltype:"date",
						key:key,
						value:value,
						required:(dictionary.required || false), 
						placeholder:"YYYY-MM-DD"
				});
				dfd.resolve(htmlField);
				break;
			case "reference":
				//{type:'reference', default:null, table:'users', field:'id', formatter:function(r) {}}
				DBModel.getAll( dictionary.table ,function(data) {
					var dummyrow={}
					var items = $.map(data, function(elem) { 
						// table for values we need
						// properties of <option>
						dummyrow[key]=elem[ dictionary.field ];
						return {
							id:elem[ dictionary.field ], 
							label:dictionary.formatter(key,dummyrow)
							} 
						});
					htmlField = new EJS({url: '/views/ff_select.ejs'}).render({
						key:key,
						value:value,	// this object id is the selected value
						items:items,	// this is the <options>		
						required: (dictionary.required==true)
					});
					dfd.resolve(htmlField);
				});
				break;
			default:
				htmlField = new EJS({url: '/views/ff_input.ejs'}).render({
						htmltype:dictionary.type,
						key:key,
						value:value,
						required:(dictionary.required || false), 
						placeholder:""
				});
				dfd.resolve(htmlField);
		}
		return dfd.promise();
	}
	return {
		bodyFromObject : function ( type, template , callback ) {
			var html="";
			var dictionary = DBModel.getDictionary(type);
			var deferreds = [];
			$.each(template, function(key,value) {
				deferreds.push( _buildField(dictionary[key],key,value) );
			});
			$.when.all(deferreds).then(function(results) {
				(callback)(results.join(""));
			});
			return;
		},
		objectFromBody : function (type, dialog) {
			var obj= DBModel.getTemplate(type);
			var dictionary = DBModel.getDictionary(type);
			var inputs = $(dialog).find("input");
			inputs.each(function(idx,elem) {
				var key = $(elem).prop('id');
				var value = $(elem).val();
				if ( (dictionary[key].required == true) || (value!="") ) {
					switch (dictionary[key].type) {
						case "date":
							obj[key]=value;
							break;
						default:
							obj[key]=value;					
					}
				}
			});
			var selects = $(dialog).find("select");
			selects.each(function(idx,elem) {
				var key = $(elem).prop('id');
				var value = $(elem).val();
				if (value=="0")
					value=null;
				obj[key]=value;
			});
			return obj;
		},
		array2Table : function (htmlid, arr,idcolumn,viscols,commands) {
			var commands = $.extend([],commands);
			var html="";
			var idcolumn = idcolumn || 'id';
			var viscols = viscols || [idcolumn];
			html+="<div class='col-xs-12'>";
			if ( (arr) && ($.isArray(arr) && (arr.length>0)) ) {
				var bFirst=true;
				html+="<table id='{0}' class='table table-condensed table-hover table-striped'>".format(htmlid);
				$.each(arr, function(idx,obj) {
					if (bFirst) {
						html+="<thead>"
						html+="<tr>"
						$.each(obj, function(k,v) {
							html+="<th data-column-id='{0}' data-formatter='{0}' {1} {2}>".format(
								k,
								(k==idcolumn) ? "data-identifier='true'" : "",
								"data-visible='{0}'".format( true /*$.inArray(k,viscols)!=-1*/ )
							)
							html+=k;
							html+="</th>"
						});
						if (commands.length>0)
							html += "<th data-column-id='commands' data-formatter='commands' data-sortable='false'>Commands</th>"
						html+="</tr>"
						html+="</thead>"
						html+="<tbody>"
						bFirst=false;
					}
					html+="<tr>"
					$.each(obj, function(k,v) {
						html+="<td>"
						html+=( (v==null) ? '' : v)
						html+="</td>"
					});
					if (commands.length>0) {
						html+="<td></td>";
					}
					html+="</tr>"
				});
				html+="</tbody>"
				html+="</table>";		
			}
			html+="</div>";
			return html;
		}
	}
})();

var DialogManager = ( function() {

	return {
		registerDialog: function( name, htmlDialog ) {
			var dialog = $("div#dialogs div#"+name);
			if (dialog.length ==0) 
				$("div#dialogs").append(htmlDialog);
			else
				$(dialog).replaceWith(htmlDialog);
			dialog = $("div#dialogs div#"+name);
			// remove all callbacks for now
			$(dialog).off();			
			$("div#dialogs").off();
			return  $(dialog);
		},

		runDialog: function(dialog, callback) {
			$(dialog).modal('show');
			$('#mnow-form').validator().on('submit', function (e) {
				if (e.isDefaultPrevented()) {
					// handle the invalid form...
					return false;
				} else {
					// everything looks good!
					(callback)();
					$(dialog).modal('hide');
					return true;
				}
			});
			// $("div#dialogs form").off('submit').on( 'submit',".btn-primary", function(e) {			} );
		}
	}
})();

var UIManager = (function(){
	function _preparePage() {
		$('main').empty();
	};
	function _onEditObject(type,id,callback) {
		DBModel.get(type,id,function(object) {
			var htmlid = 'createDialog';
			HtmlUtils.bodyFromObject(type,object,function(htmlbody) {
				var htmlDialog = new EJS({url: '/views/defaultdialog.ejs'}).render({htmlid:htmlid, title:type, body: htmlbody});
				var dialog = DialogManager.registerDialog(htmlid,htmlDialog);
				DialogManager.runDialog(dialog,function(result) {
					var obj = HtmlUtils.objectFromBody(type,$(dialog));
					(callback)(obj);
				});
			});
		});
	};
	function _onCreateObject(type,callback) {
		var template = DBModel.getTemplate(type);
		var htmlid = 'createDialog';
		HtmlUtils.bodyFromObject(type,template,function(htmlbody){
			var htmlDialog = new EJS({url: '/views/defaultdialog.ejs'}).render({htmlid:htmlid, title:type, body: htmlbody});
			var dialog = DialogManager.registerDialog(htmlid,htmlDialog);
			DialogManager.runDialog(dialog,function(result) {
				var obj = HtmlUtils.objectFromBody(type,$(dialog));
				(callback)(obj);
			});
		});
	};
	function _listPage(type) {
		var htmlid = 'idtable';
		var commandtbl = [
		"<button type=\"button\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"{0}\"><span class=\"fa fa-pencil fa-lg\"></span></button> ",
		"<button type=\"button\" class=\"btn btn-xs btn-danger command-delete \" data-row-id=\"{0}\"><span class=\"fa fa-trash-o fa-lg\"></span></button>"
		];
		function _commandFormatter(col,row) {
			return ($.map(commandtbl, function(e) { return e.format(row.id); })).join(" ");
		};
		function _updateList(type,htmlid,commandtbl) {
			// prepare referenced data
			var deferreds = [ Entities.init(type) ];
			var dictionary = DBModel.getDictionary(type);
			$.each(dictionary, function (key,field_dict) {
				if (field_dict.type=="reference")
					deferreds.push( Entities.init(field_dict.table) )
			});
			$.when.all(deferreds).then(function(results) {
				// load the template file, then render it with data
				var html = new EJS({url: '/views/defaultlist.ejs'}).render({htmlid:htmlid, title:'List: '+type, data: results[0], commandtbl:commandtbl});
				$('main').html(html);	

				// prepare formatters
				var formatters = {};
				$.each(dictionary, function (key,field_dict) {
					if (field_dict.formatter)
						formatters[key] = function(col,row) {
							return field_dict.formatter(col,row);
						};
				});
				
				// setup grid with commands and formatters
				var grid = $("#"+htmlid).bootgrid({
					caseSensitive:false,
					formatters: $.extend( formatters, {
						 "commands": _commandFormatter
					})
				}).on("loaded.rs.jquery.bootgrid", function()
				{
					/* Executes after data is loaded and rendered */
					grid.find(".command-edit").on("click", function(e)
					{
						var id = $(this).data('row-id');
						_onEditObject(type,id,function(object) {
							DBModel.update(type,object,function(result) {
								_updateList(type,htmlid,commandtbl);
							});
						});
					}).end().find(".command-delete").on("click", function(e)
					{
						var id = $(this).data('row-id');
						DBModel.del(type,id,function(result){
							_updateList(type,htmlid,commandtbl);
						});
					});
				});		
			});
		};

		_updateList(type,htmlid,commandtbl);					
		$('main')
			.off('click')
			.on('click','#mnow-create-object',function() {
				_onCreateObject(type,function(object){
					DBModel.add(type,object,function(result) {
						_updateList(type,htmlid,commandtbl);
					});
				})
			})
			// .on('click','.command-delete span',function() {

			// });		
	};
	return {
		pageProjects: function() {
			_preparePage();
			_listPage('projects');
		},
		pageUsers: function() {
			_preparePage();
			_listPage('users');
		}
	};
})();

$(document).ready(function() {
	$( document )
		.on ("click", "#mnow-page-projects", UIManager.pageProjects )
		.on ("click", "#mnow-page-users", UIManager.pageUsers )
});