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
		array2Table : function (arr,idcolumn,viscols) {
			var html="";
			var idcolumn = idcolumn || 'id';
			var viscols = viscols || [idcolumn];
			html+="<div class='col-xs-12'>";
			if ( (arr) && ($.isArray(arr) && (arr.length>0)) ) {
				var bFirst=true;
				html+="<table id='altui-grid' class='table table-condensed table-hover table-striped'>";
				$.each(arr, function(idx,obj) {
					if (bFirst) {
						html+="<thead>"
						html+="<tr>"
						$.each(obj, function(k,v) {
							html+="<th data-column-id='{0}' {1} {2}>".format(
								k,
								(k==idcolumn) ? "data-identifier='true'" : "",
								"data-visible='{0}'".format( $.inArray(k,viscols)!=-1 )
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

var Model = (function() {
	return {
		getProjects: function( callback ) {
			$.ajax({
			  url: '/api/projects',
			  dataType: "json",
			  cache:false,
			  success: function (data) {
				  callback(data);
			  }
			});
		},
		getUsers: function( callback ) {
			$.ajax({
			  url: '/api/users',
			  dataType: "json",
			  cache:false,
			  success: function (data) {
				  callback(data);
			  }
			});
		}
	}
})();

var UIManager = (function(){
	function _preparePage() {
		$('main').empty();
	};
	return {
		pageProjects: function() {
			_preparePage();
			Model.getProjects( function(data) {
				// load the template file, then render it with data
				var html = new EJS({url: '/views/defaultlist.ejs'}).render({title:'Project list', data: data});
				$('main').append(html);
			} );
		},
		pageUsers: function() {
			_preparePage();
			Model.getUsers( function(data) {
				// load the template file, then render it with data
				var html = new EJS({url: '/views/defaultlist.ejs'}).render({title:'User list', data: data});
				$('main').append(html);
			} );
		}
	};
})();

$(document).ready(function() {
	$( document )
		.on ("click", "#mnow-page-projects", UIManager.pageProjects )
		.on ("click", "#mnow-page-users", UIManager.pageUsers )
});