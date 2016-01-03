var UIManager = (function(){
	function _preparePage() {
		$('main').empty();
	};
	return {
		pageProjects: function() {
			_preparePage();
			alert('projects'); 
		},
		pageUsers: function() {
			_preparePage();
			alert('users'); 
		}
	};
})();

$(document).ready(function() {
	$( document )
		.on ("click", "#mnow-page-projects", UIManager.pageProjects )
		.on ("click", "#mnow-page-users", UIManager.pageUsers )
});