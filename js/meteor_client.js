Drupal.behaviors.meteor_client = function() {
  // Run only once
  if ( typeof Drupal.behaviors.meteor_client.counter == 'undefined' && Drupal.settings.meteor != "undefined" ) {
    Drupal.behaviors.meteor_client.counter = 0;

    Meteor.hostid = Drupal.settings.meteor.hostid;
    Meteor.host = Drupal.settings.meteor.host;

    // FIXME: Support several channels
    Meteor.registerEventCallback("process", Drupal.meteor_client.callback);
    for( ch in Drupal.settings.meteor.channels) {
      var channel = Drupal.settings.meteor.channels[ch];
      Meteor.joinChannel(channel.channelid, channel.backtrack);
      Drupal.meteor_client.callbacks[channel.channelid] = channel.callback;
      if (Drupal.settings.meteor.debug === true) {
        console.log('Meteor: Subscribed to: ' + channel.channelid);
      }
    }
    Meteor.mode = Drupal.settings.meteor.mode; 
    Meteor.connect();
    if (Drupal.settings.meteor.debug === true) {
      console.log('Meteor: Started listening on all channels.');
    }
  }
};

Drupal.meteor_client = {};
Drupal.meteor_client.callbacks = Array(); 

Drupal.meteor_client.callback = function(data) {

  var eval_data = unescape(data);

  if (Drupal.settings.meteor.debug === true) {
    console.log(eval_data);
  }
  try { 
    eval('var data_obj = ' + eval_data + ';');
    var ch = data_obj.channelid;
    if (typeof Drupal.meteor_client.callbacks[ch] != 'undefined') {
      var cb = Drupal.meteor_client.callbacks[ch];
      eval('var result = ' + cb + '(data_obj.data);');
    }
  }
  catch (e) {
    console.log('Error');
    console.log(e);
    console.log(data_obj);
  }
}
