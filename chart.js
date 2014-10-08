(function() {

	function chart() {
		// defaults
		var width = 720, height = 80;
		
		function my() {
			
		}

		 my.width = function(value) {
		    if (!arguments.length) return width;
		    width = value;
		    return my;
		  };

		  my.height = function(value) {
		    if (!arguments.length) return height;
		    height = value;
		    return my;
		  };

		  return my;
	}


})();