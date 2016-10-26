var 
	path = require('path'),
	Spawner = require('./Spawner');

function NirCmd()
{
	// wmic and semantics only make sense on Windows.
	if (process.platform !== 'win32') 
		throw new Error('Supports Windows only.');
	
	this.cmd = path.join(__dirname, "bin", "nircmd.exe")
}

NirCmd.prototype.spawn = function(subCommand, opts, next)
{
	var args = [ subCommand ].concat(opts);
	// Ensure all entries are strings.
	args = args.map(function(a) { return a ? a.toString() : null; });
	
	new Spawner()
		.command(this.cmd)
		.args(args)
		.error(function(err) 
		{ 
			return next(err, null);
		}.bind(this))
		.close(function(code, stdout, stderr) 
		{
			if (code !== 0 || stderr)
				return next(`${this.cmd} ${args.toString()} terminated with code ${code}, stderr ${stderr}`);
			
			return next(null, stdout);
		}.bind(this))
		.run();
}

/*
 opts = 
 {
	 Integer frequency: in Hz
	 Integer duration: in ms
 }
 next = function(err, result)
*/
NirCmd.prototype.beep = function(opts, next)
{
	this.spawn('beep', [ opts.frequency || 500, opts.duration || 2000 ], next);
}

/*
 opts = 
 {
	 String text
	 Integer rate: should be between -10 (very slow) and 10 (very fast)
	 Integer volume: should be between 0 and 100
 }
 next = function(err, result)
*/
NirCmd.prototype.speak = function(opts, next)
{
	var args = [ 'text', opts.text || '', opts.rate || 0, opts.volume || 50 ];
	this.spawn('speak', args, next);
}

/*
 opts = 
 {
	 String action: 'open' or 'close'
	 String drive: leave null for default cd-rom drive
 }
 next = function(err, result)
*/
NirCmd.prototype.cdrom = function(opts, next)
{
	var args = [ opts.action || 'close' ];
	this.spawn('cdrom', args, next);
}

/*
 opts = 
 {
	 Integer volumeChange: Number of volume units to increase or decrease.
	 String component: Should be one of [master, waveout, synth, cd, microphone, phone, aux, line, headphones, wavein]
	 String deviceIndex: Leave null to default to default sound card.
 }
 next = function(err, result)
*/
NirCmd.prototype.changesysvolume = function(opts, next)
{
	var args = [ opts.volumeChange || 0 ];
	if (opts.component)
		args.push(opts.component);
	if (opts.deviceIndex)
		args.push(opts.deviceIndex);
	
	this.spawn('changesysvolume', args, next);
}

/*
 opts = 
 {
	 String/Integer process: image name or /pid (e.g. /234).
	 Float volumeLevel: value in [-1, 1] to change volume by. E.g. to go from 20% to 70%, use 0.5; 70% to 0% use -0.7.
	 String/Integer deviceIndex: Leave null to default.
 }
 next = function(err, result)
*/
NirCmd.prototype.changeappvolume = function(opts, next)
{
	var args = [ opts.process ];
	if (opts.volumeLevel)
		args.push(opts.volumeLevel);
	if (opts.deviceIndex)
		args.push(opts.deviceIndex);
	
	this.spawn('changeappvolume', args, next);
}

/*
 opts = 
 {
	 Integer action: 1 for mute, 0 for unmute, 2 to switch.
	 String component: Should be one of [master, waveout, synth, cd, microphone, phone, aux, line, headphones, wavein]
	 String/Integer deviceIndex: Leave null to default.
 }
 next = function(err, result)
*/
NirCmd.prototype.mutesysvolume = function(opts, next)
{
	var args = [ opts.action ];
	if (opts.component)
		args.push(opts.component);
	if (opts.deviceIndex)
		args.push(opts.deviceIndex);
	
	this.spawn('mutesysvolume', args, next);
}

/*
 opts = 
 {
	 String/Integer process: image name or /pid.
	 Integer action: 1 for mute, 0 for unmute, 2 to switch.
	 String/Integer deviceIndex: Leave null to default.
 }
 next = function(err, result)
*/
NirCmd.prototype.muteappvolume = function(opts, next)
{
	var args = [ opts.process, opts.action ];
	if (opts.deviceIndex)
		args.push(opts.deviceIndex);
	
	this.spawn('muteappvolume', args, next);
}

/*
 opts = 
 {
	 Integer volumeLevel: value between 0 (silence) and 65535 (full volume)
	 String component: Should be one of [master, waveout, synth, cd, microphone, phone, aux, line, headphones, wavein]
	 String/Integer deviceIndex: Leave null to default.
 }
 next = function(err, result)
*/
NirCmd.prototype.setsysvolume = function(opts, next)
{
	var args = [ opts.volumeLevel ];
	if (opts.component)
		args.push(opts.component);
	if (opts.deviceIndex)
		args.push(opts.deviceIndex);
	
	this.spawn('setsysvolume', args, next);
}

/*
 opts = 
 {
	 String/Integer process: image name or /pid.
	 Float volumeLevel: value in [0, 1] to change volume by. 0 is silence, 1 is full volume.
	 String/Integer deviceIndex: Leave null to default.
 }
 next = function(err, result)
*/
NirCmd.prototype.setappvolume = function(opts, next)
{
	var args = [ opts.process, opts.volumeLevel ];
	if (opts.deviceIndex)
		args.push(opts.deviceIndex);
	
	this.spawn('setappvolume', args, next);
}

/*
 opts = 
 {
	 String action: One of [ 'off', 'on', 'low', 'async_off', 'async_on', 'async_low' ]
 }
 next = function(err, result)
*/
NirCmd.prototype.monitor = function(opts, next)
{
	this.spawn('monitor', [ opts.action ], next);
}

module.exports = function() { 
	return new NirCmd(); 
}