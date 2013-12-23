
(function() {
  'use strict';
  
  var fs = require('fs')
    , tmp = require('temporary')
    , util = require('util')
    , PubSub = require('./pubsub.js')
    , kConfigFilename = './data/config.json'
    , kConfigBackupFilename = './data/config.json.bak';

  function Config(){
    var that = PubSub.create();

    Object.defineProperty(that, 'data', {get : function() {
      return _data;},enumerable : true
    });

    that.load = function() {
      fs.readFile(kConfigFilename, 'utf-8', function(error, data) {
        if (error) throw error;
        that.publish(Config.Events.didLoad, data);
      });
      return that;
    };

    that.store = function(dataToStore) {
      _data = dataToStore;
      var tempFile = new tmp.File();

      that.on('write.data.to.temp.file.error', onWriteDataToTempFileError);
      that.on('unlink.backup.config.file.error', onUnlinkBackupConfigFileError);
      that.on('did.write.data.to.temp.file', onDidWriteDataToTempFile);
      that.on('did.unlink.backup.config.file', onDidUnlinkBackupConfigFile);
      that.on('did.rename.config.file.to.backup', onDidRenameConfigFileToBackup);
      that.on('did.rename.temp.file.to.config.file', onDidRenameTempFileToConfigFile);

      function onWriteDataToTempFileError(error) {logErrorAndCleanup(error);};
      function onUnlinkBackupConfigFileError(error) {logErrorAndCleanup(error);};
      function logErrorAndCleanup(error) {console.error(error); unsubscribeAllEvents();};
      function onDidWriteDataToTempFile(tempFile) {backupConfigFile();};
      function onDidUnlinkBackupConfigFile() {renameConfigFileToBackup();};
      function onDidRenameConfigFileToBackup() {renameTempFileToConfigFile(tempFile);};
      function onDidRenameTempFileToConfigFile() {onDone();};

      function onDone() {
        that.publish(Config.Events.didStore, dataToStore);
        unsubscribeAllEvents();
      };

      function unsubscribeAllEvents() {
        that.off('write.data.to.temp.file.error', onWriteDataToTempFileError);
        that.off('unlink.backup.config.file.error', onUnlinkBackupConfigFileError);
        that.off('did.write.data.to.temp.file', onDidWriteDataToTempFile);
        that.off('did.unlink.backup.config.file', onDidUnlinkBackupConfigFile);
        that.off('did.rename.config.file.to.backup', onDidRenameConfigFileToBackup);
        that.off('did.rename.temp.file.to.config.file', onDidRenameTempFileToConfigFile);
      }

      writeDataToTempFile(tempFile);
    };

    function writeDataToTempFile(tempFile) {
      fs.writeFile(tempFile.path, _data, 'utf-8', function(error) {
        if (error) {that.publish('write.data.to.temp.file.error', error);}
        else {that.publish('did.write.data.to.temp.file', tempFile);}
      });
    }

    function backupConfigFile() {
      fs.exists(kConfigBackupFilename, function(exists) {
        if (exists) {unlinkBackupConfigFile();}
        else {renameConfigFileToBackup();}
      });
    }

    function unlinkBackupConfigFile() {
      fs.unlink(kConfigBackupFilename, function(error) {
        if (error) {that.publish('unlink.backup.config.file.error', error);}
        else {that.publish('did.unlink.backup.config.file');}
      });
    }

    function renameConfigFileToBackup() {
      fs.rename(kConfigFilename, kConfigBackupFilename, function(error) {
        if (error) {that.publish('rename.config.file.to.backup.error', error);}
        else {that.publish('did.rename.config.file.to.backup');}
      });
    }

    function renameTempFileToConfigFile(tempFile) {
      fs.rename(tempFile.path, kConfigFilename, function(error) {
        if (error) {that.publish('rename.temp.file.to.config.file.error', error);}
        else {that.publish('did.rename.temp.file.to.config.file');}
      });
    }

    that.on(Config.Events.didLoad, function(data) {_data = data;});

    var _data;

    return that;
  };

  Config.create = function() {return new Config();};
  Config.Events = {
    get didLoad(){return 'config.did.load';},
    get didStore(){return 'config.did.store';}
  }
  module.exports = Config;

}).call(this);
