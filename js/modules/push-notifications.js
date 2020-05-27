export default () => {
  let servicew;
  //Genereras på servern
  const publicKey = "BBplhidqNPeLGzhIeXbQf736vi_WOJA3_b8mPS_0a1IWE77wQzojHmgLRw9ks4AQ3NpbSrSOgaD9Sqw4ghTlVfA";

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    //Hämta våran service worker och sedan kolla om vi redan har en subscription
    navigator.serviceWorker.ready.then((sw) => {
      servicew = sw;
      sw.pushManager.getSubscription().then((subscription) => {
        console.log('Is subscribed: ', subscription);
        if (subscription !== null) {
          document.querySelector('.subInfo').innerHTML = 'Unsubscribe from notifications'
        }
      });

    });
  }

  const urlB64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  //Skickar vår endpoint för att användas på servern
  async function saveSubscription(subscription) {
    const url = "https://push-notifications-api.herokuapp.com/api/notifications/save";
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(subscription),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data.uuid);
  }

  //Message that pops up depending on subscribing / unsubscribing to push-notifications
  function subInfoText(isSubscribed) {
    const info = document.createElement('p');
    document.querySelector('.pushWrapper').appendChild(info);
    document.querySelector('#subText').classList.toggle('hidden');
    document.querySelector('#subScribe').classList.toggle('hidden');
    if (isSubscribed === true) {
      info.innerHTML = 'You have successfully unsubscribed.'
      setTimeout(() => {
        info.parentElement.removeChild(info);
        document.querySelector('#subText').classList.toggle('hidden');
        document.querySelector('#subScribe').classList.toggle('hidden');
      }, 5000)
    } else if (isSubscribed === false) {
      info.innerHTML = 'You are now subscribed to push-notifications from us. Yay!'
      setTimeout(() => {
        info.parentElement.removeChild(info);
        document.querySelector('#subText').classList.toggle('hidden');
        document.querySelector('#subScribe').classList.toggle('hidden');
      }, 5000)
    }
  }

  document.querySelector('#subScribe').addEventListener('click', (event) => {
    event.srcElement.disabled = true;
    //Hämtar eventuell subscription och ifall vi har en så gör vi en unsubscribe
    //Ifall vi inte har subscription så börjar vi prenumerera på notiser och skickar till servern
    //Vår subscription
    servicew.pushManager.getSubscription().then(async (subscription) => {
      if (subscription) {
        subscription.unsubscribe(); //Sluta prenumerera på push notiser
        event.srcElement.disabled = false;
        subInfoText(true);
        document.querySelector('.subInfo').innerHTML = 'Get notifications from us'
      } else {
        try {
          //Start subscribing to push notifications and save subscription on remote server via endpoint API
          const subscribed = await servicew.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(publicKey)
          });
          saveSubscription(subscribed);
          console.log(subscribed);
          event.srcElement.disabled = false;
          subInfoText(false);
          document.querySelector('.subInfo').innerHTML = 'Unsubscribe from notifications'
        } catch (error) {}
      }
    });
  });
}