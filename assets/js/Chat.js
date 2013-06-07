// Tutorial:
//
// 1) Build simple Backbone chat app
// 2) Implement realtime with raw socket.io stuff
// 3) Demonstrate switching to use the Sails Backbone SDK instead

// Set up socket connection initially
var Socket = io.connect();
Socket.on('connect', function () {

	// Fetching the initial list of chats
	// also subscribes to the Chat model
	Socket.request('/chat', {}, function (chats) {});
});

// Listen for messages over the socket
Socket.on('message', function (msg) {

	// Route messages appropriately
	if (msg.verb === 'create' && msg.model === 'chat') {
		console.log(msg);
		chatList.newChat(msg.data);
	}
});

// Create global collection, since we might want to use this data
// in other views in our app
var RecentChats = new Backbone.Collection.extend({
	model: Backbone.Model
});

// Each instance of this view controls a chat on the page
var Chat = Backbone.View.extend({

	// Get template from JST import (templates directory)
	template: JST['assets/templates/Chat.html'],

	initialize: function (chat) {
		this.data = chat;
	},

	render: function () {
		return this.template(this.data);
	}
});

// This view controls the chat list on the page
var ChatList = Backbone.View.extend({

	el: '.chat-region',

	initialize: function () {

		// Link collection to view
		this.collection = RecentChats;
	},

	newChat: function (chat) {
		var chatView = new Chat(chat);
		this.$el.append(chatView.render());
	}
});

// This view controls the chat form on the page
var ChatForm = Backbone.View.extend({
	
	el: '.chat-form',

	events: {
		'submit': function (e) {
			e.preventDefault();
			return false;
		},
		'click button.submit': function () {
			Socket.request('/chat/create', {
				message: this.$('textarea[name="message"]').val(),
				username: 'Me'
			}, function () {});
		}
	}

});

// Instantiate top level views so we can get this party started!
var chatList = new ChatList();
var chatForm = new ChatForm();

