'use strict';
const spawnSync = require('child_process').spawnSync;
const mkdirp = require('mkdirp');
const fs = require('fs');
const glob = require('glob');
const pretty = require('js-beautify');
const parse = require('path').parse;
const async = require('async');
const extend = require('lodash').extend

/**
 * Gapps CLI Runner
 *
 * @param {Object} argv command line args formatted via minimist
 * @param {Object} client Auth'd Google Drive client
 */
function CLI(argv, client) {

  let localConfig;

  try {

    localConfig = JSON.parse(fs.readFileSync('./.gappscli.lc', 'utf-8')); 

  } catch(e) {}

  const fileId = localConfig ? localConfig.fileId : argv.fileId;
  const command = argv._.shift();
  const args = argv._;


  if (!fileId) {

		return console.log('Error: Missing required argument fileId. Configure the' +
			' .gappscli.lc JSON or pass in the fileId with the --fileId flag.');

	}

	function getFiles(callback) {

		let config = {
			fileId: fileId,
			mimeType: 'application/vnd.google-apps.script+json'
		};

		client.files.export(config, callback);

	}

  const commands = {
    fetch: () => {
			
			console.log('Fetching files...');
      getFiles((err, resp) => {

				if (err) { 

					console.error('There was an error while retrieving the project files.');
					console.error(err);
					console.error('Sorry, Dave.');
					return;

				}
				
				let files = resp.files;
				let createdPaths = {};

				console.log(`Finished retrieving ${files.length} files, unpacking...`);	
			
				files.filter(file => {

          let parsed = parse(file.name);
          
          // Filter for valid files
          return ['.gs', '.js', '.html'].indexOf(parsed.ext) > -1;

        }).forEach(file => {

					let parsed = parse(file.name);
					let type = file.type;
					let filename = parsed.name;
					let ext = parsed.ext;
					let path = parsed.dir && parsed.dir !== '.' ? 
						(parsed.dir + '/').replace(/^\.\//, '') 
						: '';
					let src = file.source;
					let out = src;
					let outPath;

					if (type === 'html') {

						if (ext === '.js') {

							out = src.match(/<script.*?>\n([\s\S]*)<\/script>/)[1];

						} else {

							ext = '.html'; 

						}

					} else if (type === 'server_js') {

						ext = '.gs';

					}	

					if (path && !createdPaths[path]) {

						console.log(`Creating new directory ${path}...`);
						mkdirp.sync(path);
						console.log(`Directory ${path} created!`);
						createdPaths[path] = true;

					}

					outPath = path + filename + ext;

					console.log(`Writing file to ${outPath}...`)
					fs.writeFileSync(outPath, out);
					console.log(`File ${filename + ext} written to ${outPath}.`);

				});	

				console.log('Files unpacked.');
				console.log('Success!');

      });

    },
    push: (callback) => {

			console.log('Building files...');
			console.log('Uploading files to Google Apps Script servers...');

			async.parallel([
				glob.bind(this, './**/*', {nodir: true}),
				getFiles
			], (err, results)  => {

				if (err) {
	
					console.error('Error uploading files.');
					console.error(err);
					return;

				}
				let localFiles = results[0];
				let upstreamFiles = results[1][0].files;
				let upstreamIdMap = upstreamFiles.reduce((map, f) => {

					map[f.name] = f.id;
					return map;

				}, {});

				let payload = localFiles.map(file => {

					let parsed = parse(file);
					let data = fs.readFileSync(file, 'utf-8');
					let name = parsed.name;
					let path = parsed.dir !== '.' ? (parsed.dir + '/').replace(/^\.\//, '') : '';
					let ext = parsed.ext;
					let type = 'html';
					let id = upstreamIdMap[path + name + (ext === '.js' ? ext : '')];
					let scriptId;

					if (ext === '.gs') {

						type = 'server_js';

					}

					if (ext === '.js') {
		
						scriptId = (path + name)
							.toLowerCase()
							.replace(/\//g, '_')
							.replace(/\s/g, '-'); 
 
						data = pretty.html_beautify(`<script id="${scriptId}">${data}</script>`, {
							indent_size: 2,
							good_stuff: true
						});

						name = name += '.js';

					}

					if (ext === '.html') {

						data = pretty.html_beautify(data, {
							indent_size: 2,
							good_stuff: true
						});

					}

					let fileObj = {
						name: (path + name),
						type:	type,
						source: data,
					};

				 	if (id) fileObj.id = id;

					return fileObj;
	
				});

				client.files.update({
					fileId: fileId,
					media: {
						mimeType: 'application/vnd.google-apps.script+json',
						body: JSON.stringify({files: payload})
					}
				}, (err, results) => {

					if (err) return console.log(err);

					console.log(`Success! ${payload.length} files uploaded to Google Apps Script.`);

					process.exit(0);

				});

			});

		}

  }
	
  commands[command].apply(this, args);

}

module.exports = CLI;
