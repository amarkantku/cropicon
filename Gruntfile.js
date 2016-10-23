module.exports = function(grunt){
  	grunt.initConfig({
  		pkg: grunt.file.readJSON('package.json'),
    	concat: {
      		options: {
	        	process: function(src, path){
	          		return '\n/* Source: ' + path + ' */\n' + src;
	        	}
      		},
	      	src: [
	        	'../js/**/*.js'
	      	],
	      	dest: '../bin/app-debug.js'
    	},
    	uglify: {
		    options: {
		      	banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		    },
		    build: {
		      	src: 'src/<%= pkg.name %>.js',
		      	dest: 'build/<%= pkg.name %>.min.js'
		    }
		},
    	watch: {
      		options: {
        		atBegin: true,
        		event: ['all']
      		},
      		src: {
        		files: '../js/**/*.js',
        		tasks: ['concat']
      		},
      		dist: {
        		files: '../bin/app-debug.js',
        		tasks: ['uglify','node_optimize']
      		},
    	},
    	node_optimize: {
        	dist: {
            	options: {
                	ignore: [
                    	'config/db.js',
                    	'config/private.pem',
                    	'config/public.pem',

                    	'config/private-rsa-1024.pem',
                    	'config/public-rsa-1024.pem',

                    	'config/private-rsa-2048.pem',
                    	'config/public-rsa-2048.pem',

                    	'config/secret-key.js'
                	]
            	},
            	files: {
                	'dist/main.optimized.js': 'main.js'
            	}
        	}
    	}
	});

	// Load the plugin that provides the "uglify" task.
  	grunt.loadNpmTasks('grunt-contrib-concat');
  	grunt.loadNpmTasks('grunt-contrib-uglify');
  	grunt.loadNpmTasks('grunt-contrib-watch');
  	grunt.loadNpmTasks('grunt-node-optimize');

  	grunt.registerTask('default', ['watch']);
}