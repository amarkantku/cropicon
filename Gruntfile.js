module.exports = function(grunt){
  	grunt.initConfig({
  		pkg: grunt.file.readJSON('package.json'),
        clean: ["dist", '.tmp'],
    	concat: {
      		options: {
	        	process: function(src, path){
	          		return '\n/* Source: ' + path + ' */\n' + src;
	        	},
                separator: ';'
      		},
	      	src: [
	        	'../js/**/*.js'
	      	],
	      	dest: '../bin/app-debug.js'
    	},
    	uglify: {
            task_one:{
                options: {
                    separator: ';',
                    report: 'min',
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    /*mangle: {
                        except: ['jQuery', 'Backbone']
                    },*/
                    mangle : false,
                    sourceMap: true,
                    sourceMapName: 'public/angular/app/<%= pkg.name %>.min.js.map',
                    beautify: true
                },
               
                files: {
                    'public/angular/app/<%= pkg.name %>.min.js': [
                        'public/angular/app/cropicon.js',
                        'public/angular/app/controller/public.js',
                        'public/angular/app/directive/directive.js',
                        'public/angular/app/auth/authService.js',
                        'public/angular/app/auth/users.js',
                    ]
                },
            },
            task_two:{
                options: {
                    separator: ';',
                    report: 'min',
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    /*mangle: {
                        except: ['jQuery', 'Backbone']
                    },*/
                    mangle : false,
                    sourceMap: true,
                    sourceMapName: 'public/javascripts/<%= pkg.name %>.all.min.js.map',
                    // beautify: true
                },

                files: {
                    'public/javascripts/<%= pkg.name %>.all.min.js' : [
                        'public/javascripts/modernizr-2.6.2.min.js',
                        'public/javascripts/bootstrap.min.js',
                        'public/javascripts/main.js',
                    ],
                }
            },
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
        		tasks: ['uglify','html2js','node_optimize','cacheBust']
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
                	// 'dist/main.optimized.js': 'main.js'
            	}
        	}
    	},
        cacheBust: {
            options: {
                length: 16,
                rename: true,
                encoding: 'utf8',
                algorithm: 'md5',
                hash: '<%= ((new Date()).valueOf().toString()) + (Math.floor((Math.random()*1000000)+1).toString()) %>',
                queryString: true,
                deleteOriginals: false,
                assets: ['public/angular/app/'],
                baseDir: './public/',
                jsonOutput: true,

            },
            assets: {
                src: ['public/angular/app/<%= pkg.name %>.min.js']
            }
        },
        html2js: {
            options: {
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                }
            },
            main: {
              src: ['views/users/*.pug'],
              dest: 'tmp/templates.js'
            },
        },
	});

	// Load the plugin that provides the "uglify" task.
  	grunt.loadNpmTasks('grunt-contrib-concat');
  	grunt.loadNpmTasks('grunt-contrib-uglify');
  	grunt.loadNpmTasks('grunt-contrib-watch');
  	grunt.loadNpmTasks('grunt-node-optimize');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-cache-bust');

  	grunt.registerTask('default', ['watch']);
}