//# sourceURL=UIManager.js
// "use strict";


var UIManager = (function(){
	function _preparePage() {
		$('main').empty();
	};
	function _onEditObject(type,id,callback) {
		DBModel.get(type,id,function(object) {
			var htmlid = 'createDialog';
			HtmlUtils.bodyFromObject(type,object,MODE_EDIT,function(htmlbody) {
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
		HtmlUtils.bodyFromObject(type,template,MODE_EDIT,function(htmlbody){
			var htmlDialog = new EJS({url: '/views/defaultdialog.ejs'}).render({htmlid:htmlid, title:type, body: htmlbody});
			var dialog = DialogManager.registerDialog(htmlid,htmlDialog);
			DialogManager.runDialog(dialog,function(result) {
				var obj = HtmlUtils.objectFromBody(type,$(dialog));
				(callback)(obj);
			});
		});
	};
	function _listPage(type,click_callback) {
		var htmlid = 'idtable';
		var commandtbl = [
		"<button type=\"button\" class=\"btn btn-xs btn-default command-edit\" data-row-id=\"{0}\"><span class=\"fa fa-pencil fa-lg\"></span></button> ",
		"<button type=\"button\" class=\"btn btn-xs btn-danger command-delete \" data-row-id=\"{0}\"><span class=\"fa fa-trash-o fa-lg\"></span></button>"
		];
		function _commandFormatter(col,row) {
			return ($.map(commandtbl, function(e) { return e.format(row.id); })).join(" ");
		};
		
		function _updateList(type,htmlid,commandtbl) {
			var dictionary = DBModel.getDictionary(type);
			$.when(DBModel.getAll(type)).then(function(results) {
				// load the template file, then render it with data
				var html = new EJS({url: '/views/defaultlist.ejs'})
				.render({
					htmlid:htmlid, 
					title:'List: '+type, 
					data: results, 
					commandtbl:commandtbl});
					
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
				})
				.on("click.rs.jquery.bootgrid", function(e,cols,row) {
					if ($.isFunction(click_callback))
						(click_callback)(row.id);
				})
				.on("loaded.rs.jquery.bootgrid", function() {
					/* Executes after data is loaded and rendered */
					grid.find(".command-edit").on("click", function(e)
					{
						var id = $(this).data('row-id');
						_onEditObject(type,id,function(object) {
							DBModel.update(type,object,function(result) {
								_updateList(type,htmlid,commandtbl);
							});
						});
						return false;	// prevent new handlers
					}).end().find(".command-delete").on("click", function(e)
					{
						var id = $(this).data('row-id');
						DBModel.del(type,id,function(result){
							_updateList(type,htmlid,commandtbl);
						});
						return false;	// prevent new handlers
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
				return false;	// prevent new handlers
			})	
	};
	function _onePage(type,id) {	
		// var deferred = [];
		// deferred.push(DBModel.get(type,id).done(obj) { _obj = obj; } );
		$.when(DBModel.get(type,id))
		.done( function(object) {
			$.when(HtmlUtils.bodyFromObject(type,object,MODE_VIEW))
			.done( function(fieldvalues) {
				var viewmodel = {
					title:DBModel.name( type,object ) || type,
					type: type,
					object:object,
					resolved_object:fieldvalues
				};
				// prepare list of all remote references
				var remote_ref = DBModel.getRemoteReferences(type);
				var deferreds = [];
				$.each(remote_ref, function(remotetype,info) {
					// find all objects which remote ref value is equal to "id"
					// info = {field:fieldname, fieldkey: fielddescr.field}
					var filter = ['{0}=\'{1}\''.format(info.remotefield,object[info.localfield])];
					deferreds.push( 
						DBModel.getAll(remotetype,filter).then(function(list) {
							remote_ref[remotetype].result = list;
						})
					);
				});
				$.when.all(deferreds).then(function(results) {
					// render view
					viewmodel.references={};
					$.each(remote_ref, function(remotetype,info) {
						viewmodel.references[remotetype]=
							HtmlUtils.array2Table(
								'{0}-{1}'.format(remotetype,info.remotefield),		//htmlid 
								info.result,
								'id',
								null,
								null)
					});
					// viewmodel.references = remote_ref;
					var html = new EJS({url: '/views/viewobject.ejs'}).render(viewmodel);
					$('main').html(html);	
					
					//bootgridify
					$.each(remote_ref, function(remotetype,info) {
						var grid = $("#"+'{0}-{1}'.format(remotetype,info.remotefield)).bootgrid({
							caseSensitive:false
						})
					});
				});
			});
		});
	};
	return {
		pageProjects: function() {
			_preparePage();
			_listPage('projects',UIManager.pageProject);
		},
		pageProject: function(id) {
			_preparePage();
			_onePage('projects',id);
		},
		pageMilestones: function() {
			_preparePage();
			_listPage('milestones',UIManager.pageMilestone);
		},
		pageMilestone: function(id) {
			_preparePage();
			_onePage('milestones',id);
		},
		pageUsers: function() {
			_preparePage();
			_listPage('users',UIManager.pageUser);
		},
		pageUser: function(id) {
			_preparePage();
			_onePage('users',id);			
		}
	};
})();

$(document).ready(function() {
	$( document )
		.on ("click", "#mnow-page-projects", UIManager.pageProjects )
		.on ("click", "#mnow-page-users", UIManager.pageUsers )
		.on ("click", "#mnow-page-milestones", UIManager.pageMilestones )		
});