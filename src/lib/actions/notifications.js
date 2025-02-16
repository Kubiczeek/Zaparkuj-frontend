function requestNotificationPermission() {
	if ('Notification' in window) {
		Notification.requestPermission().then(permission => {
			if (permission === 'granted') {
				console.log('Notification permission granted.');
			} else {
				console.log('Notification permission denied.');
			}
		});
	} else {
		console.log('Notifications are not supported by this browser.');
	}
}

export function sendNotification(title, options) {
	if ('Notification' in window) {
		if (Notification.permission === 'granted') {
			console.log('Sending notification:', title, options);
			new Notification(title, options);
		} else if (Notification.permission !== 'denied') {
			console.log('Requesting notification permission.');
			requestNotificationPermission();
		} else {
			console.log('Notification permission denied.');
		}
	} else {
		console.log('Notifications are not supported by this browser.');
	}
}