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
		model2Form : function(model) {
			$.each( model, function(key, value){
			});
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
		bodyFromTemplate : function ( template ) {
			var html="<form>";
			$.each(template, function(key,value) {
				var placeholder = "";
				if (key.slice(-4)=='date')
					placeholder = "YYYY-MM-DD";
				var htmlField = new EJS({url: '/views/ff_input.ejs'}).render({htmltype:"text",key:key,value:value,placeholder:placeholder});
				html += htmlField;
			});
			html+="</form>";
			return html;
		},
		runDialog: function(dialog, callback) {
			$(dialog).modal('show');
			$("div#dialogs").on( 'click',".btn-primary", function() {
				var obj= {};
				$(dialog).find("input").each(function(idx,elem) {
					obj[$(elem).prop('id')]=$(elem).val();
				});
				(callback)(obj);
				$(dialog).modal('hide');
			} );
		}
	}
})();
	
var Model = (function() {
	return {
		getTemplate:function(type) {
			switch(type) {
				case 'projects':
					return {
						"id":"",
						"project_name":"",
						"prod_date":""
					}
				case 'users':
					return {
						"id":"",
						"first_name":"",
						"last_name":"",
						"email":"",
						"location":""
					}
				default:
			}
			return null;
		},
		
		get:function(objtype, callback ) {
			$.ajax({
			  url: '/api/'+objtype,
			  dataType: "json",
			  cache:false,
			  success: function (data) {
				  callback(data);
			  }
			});
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

var UIManager = (function(){
	function _preparePage() {
		$('main').empty();
	};
	function _onCreateObject(type,callback) {
		var template = Model.getTemplate(type);
		var htmlid = 'createDialog';
		var htmlDialog = new EJS({url: '/views/defaultdialog.ejs'}).render({htmlid:htmlid, title:type, body: DialogManager.bodyFromTemplate(template)});
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
			Model.get( type,function(data) {
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
						alert("You pressed edit on row: " + $(this).data("row-id"));
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