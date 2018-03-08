/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BE2X6vQjGgS5vY4DVyKTUyQObbpaiZBn9wnKub_tyzGbEO1XUfvL8TcygMR4IudLg0BVwlJhnkNqA2op0DXw16A';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('ServiceWorker y Notificaciones Soportadas');

  navigator.serviceWorker.register('./sw.js')
    .then( (swreg) => {
      console.log('Service Worker Registrado', swreg);
      swRegistration = swreg;
      inicializarUI();
    } )
    .catch( (error) => console.error("Error", error))
}else{
  console.warn('Notificaciones no Soportadas');
  pushButton.textContent = "Notificaciones No Soportadas";
}

function inicializarUI(){

  pushButton.addEventListener('click', function(){
    pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    }else{
      subscribeUser();
    }
  });


  swRegistration.pushManager.getSubscription()
    .then( subscripcion => {
      isSubscribed = !(subscripcion === null);
      if (isSubscribed) {
        console.log( "Esta Subscrito")
      }
      else{
        console.log("NO Subscrito");
      }

      updateBtn();
    } );
}

function updateBtn(){
  if (Notification.permission === 'denied') {
    pushButton.textContent = "Push Bloqueado";
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed){
    pushButton.textContent ="Deshabilitar";
  }else{
    pushButton.textContent = "Habilitar";
  }

  pushButton.disabled = false;
}

function subscribeUser(){
  const appServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly : true
    , applicationServerKey : appServerKey
  })
    .then( function(subscription){
        console.log('Usuario Subscrito');
        updateSubscriptionOnServer(subscription);
        isSubscribed = true;
        updateBtn();
    } )
    .catch( (error) =>{
      console.error('Fallo la subscripcion', error)
      updateBtn();
    });
}

function updateSubscriptionOnServer(subscription){
  const subscriptionJSON = document.querySelector('.js-subscription-json');
  const subscriptionDetails = document.querySelector('.js-subscription-details');
  if (subscription) {
    subscriptionJSON.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove('is-invisible');
  }else{
    subscriptionDetails.classList.add('is-invisible');
  }
}

function  unsubscribeUser(){
  swRegistration.pushManager.getSubscription()
    .then( function( subscription ){
        if (subscription) {
          return subscription.unsubscribe();
        }
    } )
    .catch( (err) => console.error( "Error al desuscribir", err ))
    .then( () => {
      updateSubscriptionOnServer(null)
      console.log("desuscrito");
      isSubscribed = false;
      updateBtn();

    })
}