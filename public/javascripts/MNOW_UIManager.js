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
		array2Table : function (htmlid, arr,idcolumn,viscols) {
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
		Model.get( type,function(data) {
			// load the template file, then render it with data
			var htmlid = 'idtable';
			var html = new EJS({url: '/views/defaultlist.ejs'}).render({htmlid:htmlid, title:'Project list', data: data});
			$('main').html(html);
			$("#"+htmlid).bootgrid();						
			$('#mnow-create-object').click( function() {
				_onCreateObject(type,function(result){
					Model.get( type,function(data) {
						var html = new EJS({url: '/views/defaultlist.ejs'}).render({htmlid:htmlid, title:'Project list', data: data});
						$('main').html(html);			
						$("#"+htmlid).bootgrid();						
					});
				});
			});
		} );		
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