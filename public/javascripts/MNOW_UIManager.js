//# sourceURL=MNOW_UIManager.js
// "use strict";
	
var Model = (function() {
	var _dictionary = {
		"projects":{
			"id": 			{type:'number', default:''},
			"project_name":	{type:'text', 	default:'' , required:true },
			"prod_date":	{type:'date', 	default:''},
		},
		"users":{
			"id": 			{type:'number', default:''},
			"first_name":	{type:'text', 	default:''},
			"last_name":	{type:'text', 	default:''},
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
			$.ajax({
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
				  data: object,
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
			  data: object,
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

var HtmlUtils = (function() {
	return {
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
							html+="<th data-column-id='{0}' {1} {2}>".format(
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
						html+=v;
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
		bodyFromObject : function ( type, template ) {
			var html="";
			var dictionary = Model.getDictionary(type);
			$.each(template, function(key,value) {
				var placeholder = "";
				var htmltype="text";
				switch (dictionary[key].type) {
					case "date":
						placeholder = "YYYY-MM-DD";
						htmltype="date";
						break;
					case "number":
						htmltype="number";
						break;
					default:
						htmltype=dictionary[key].type;
				}
				var htmlField = new EJS({url: '/views/ff_input.ejs'}).render({
						htmltype:htmltype,
						key:key,
						value:value,
						required:(dictionary[key].required || false), 
						placeholder:placeholder
				});
				html += htmlField;
			});
			return html;
		},
		runDialog: function(dialog, callback) {
			$(dialog).modal('show');
			$('#mnow-form').validator().on('submit', function (e) {
				if (e.isDefaultPrevented()) {
					// handle the invalid form...
					return false;
				} else {
					// everything looks good!
					var obj= {};
					$(dialog).find("input").each(function(idx,elem) {
						obj[$(elem).prop('id')]=$(elem).val();
					});
					(callback)(obj);
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
		Model.get(type,id,function(object) {
			var htmlid = 'createDialog';
			var htmlDialog = new EJS({url: '/views/defaultdialog.ejs'}).render({htmlid:htmlid, title:type, body: DialogManager.bodyFromObject(type,object)});
			var dialog = DialogManager.registerDialog(htmlid,htmlDialog);
			DialogManager.runDialog(dialog,function(result) {
				(callback)(result);
			});
		});
	};
	function _onCreateObject(type,callback) {
		var template = Model.getTemplate(type);
		var htmlid = 'createDialog';
		var htmlDialog = new EJS({url: '/views/defaultdialog.ejs'}).render({htmlid:htmlid, title:type, body: DialogManager.bodyFromObject(type,template)});
		var dialog = DialogManager.registerDialog(htmlid,htmlDialog);
		DialogManager.runDialog(dialog,function(result) {
			Model.add(type,result,function() {
				(callback)(result);
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
			Model.getAll( type,function(data) {
				// load the template file, then render it with data
				var html = new EJS({url: '/views/defaultlist.ejs'}).render({htmlid:htmlid, title:'List: '+type, data: data, commandtbl:commandtbl});
				$('main').html(html);			
				var grid = $("#"+htmlid).bootgrid({
					formatters: {
						 "commands": _commandFormatter
					}
				}).on("loaded.rs.jquery.bootgrid", function()
				{
					/* Executes after data is loaded and rendered */
					grid.find(".command-edit").on("click", function(e)
					{
						var id = $(this).data('row-id');
						_onEditObject(type,id,function(object) {
							Model.update(type,object,function(result) {
								_updateList(type,htmlid,commandtbl);
							});
						});
					}).end().find(".command-delete").on("click", function(e)
					{
						var id = $(this).data('row-id');
						Model.del(type,id,function(result){
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
				_onCreateObject(type,function(result){
					_updateList(type,htmlid,commandtbl);
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