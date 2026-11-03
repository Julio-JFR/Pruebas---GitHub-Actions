self.addEventListener('push', (e) => {
    const data = e.data.json();
    const title = data.title || 'ACEPTADO POR UN ESPECIALISTA';
    const options = {
        body: data.body || 'nada',
        icon: 'assets/images/logoPrincipal.png' || '',
        badge: 'assets/images/badgeLogo.png' || '',
        data: {
            url: data.url || '/'
        },
        vibrate: [
            125,75,125,275,200,275,125,75,125,275,200,600,200,600
        ]
    };

    e.waitUntil(self.registration.showNotification(title, options));
});

//Hola

self.addEventListener('notificationclick', e => {
    const notificacion = e.notification;

    clients.openWindow(notificacion.data.url || '/');

    notificacion.close();
});