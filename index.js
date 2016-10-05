var metalsmith 	= require('metalsmith'),
	markdown   	= require('metalsmith-markdown'),
	templates  	= require('metalsmith-templates'),
	collections = require('metalsmith-collections'),
	permalinks  = require('metalsmith-permalinks'),
	Handlebars 	= require('handlebars'),
	fs         	= require('fs');



var deletePartialMarkdownFiles = function(files, metalsmith, done) {

	meta = metalsmith.metadata();
	for (var file in files) {
		var type = files[file].type;
		if (type == "partial" || type == "code") {
			delete files[file];
		}
	}
	done();
};

var parseContentForSnippet = function (files, metalsmith, done) {
	var contents;
	var cleancontents;
	var snippet;
	var snippetclean;

	Object.keys(files).forEach(function (file) {
		var type = files[file].type;
		contents = files[file].contents.toString();
		if (type == "partial") {
			
			try {
				cleancontents = contents.replace(/\[snippet\][\s\S]*?\[\/snippet\]/i, "");

				snippet = contents.match(/\[snippet\][\s\S]*?\[\/snippet\]/i);

				if (snippet) {
					snippetclean = snippet[0];
					
					snippetclean = snippetclean.replace(/\[snippet\]/, "");
					snippetclean = snippetclean.replace(/\[\/snippet\]/, "");

					const buffsnippet = new Buffer(snippetclean);
					files[file].snippet = buffsnippet;

					const buffcontents = new Buffer(cleancontents);
					files[file].contents = buffcontents;

				} else {
					cleancontents = null;
					contents = null;
					snippet = null;
					snippetclean = null;
				}
			} catch(err) {
				return err.message;
			}
		}
	});
	done();
};

Handlebars.registerPartial('header', fs.readFileSync(__dirname + '/templates/partials/header.html').toString());
Handlebars.registerPartial('footer', fs.readFileSync(__dirname + '/templates/partials/footer.html').toString());
Handlebars.registerPartial('listpagebreadcrumb', fs.readFileSync(__dirname + '/templates/partials/listpagebreadcrumb.html').toString());

// helper to slugify strings
Handlebars.registerHelper('slug', function(content){
	var spacesToDashes = content.split(' ').join('-').toLowerCase();
	var removeChars = spacesToDashes.replace(/[^a-zA-Z0-9\- ]/g, "");
	return removeChars;
});

// helper to update date, format: 10 Mar 2014
Handlebars.registerHelper('date', function(){
	var date = new Date();
	var day = date.getDate();
	var month = [];
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";
	var year = date.getFullYear();
	var str = day + ' ' + month[date.getMonth()] + ' ' + year;
	return str;
});

// if equals helper
Handlebars.registerHelper('if_eq', function(a, b, opts) {
	if(a == b)
		return opts.fn(this);
	else
		return opts.inverse(this);
});

// if not equals helpers
Handlebars.registerHelper('if_ne', function(a, b, opts) {
	if (a != b) {
		return opts.fn(this);
	}  else {
		return opts.inverse(this);
	}
});

metalsmith(__dirname)
	.use(parseContentForSnippet)
	.use(collections({
		buttons: {
			pattern: 'buttons/partials/*.md',
			sortBy: 'order'
		},
		colours: {
			pattern: 'colours/partials/*.md',
			sortBy: 'order'
		},
		components: {
			pattern: 'components/partials/*.md',
			sortBy: 'order'
		},
		forms: {
			pattern: 'forms/partials/*.md',
			sortBy: 'order'
		},
        layout: {
			pattern: 'layouts/partials/*.md',
			sortBy: 'order'
		},
		patterns: {
			pattern: 'patterns/partials/*.md',
			sortBy: 'order'
		},
		typography: {
			pattern: 'typography/partials/*.md'
		}
	}))
	.use(markdown())
	.use(templates('handlebars'))
	.use(deletePartialMarkdownFiles)
	.destination('./build')
	.build(function (err) { if(err) console.log(err) });
