/* Sostituto di Telegram.WebApp per i giochi in modo Discord. I giochi della mini app chiamano
   Telegram.WebApp per login (initData), vibrazioni, tasto indietro e colori: qui non serve niente di
   tutto questo, quindi ogni metodo esiste e non fa nulla. initData e' VUOTA: il server riconosce il
   giocatore dal gettone di sessione Discord, mai da qui. Nessun link verso la mini app o il bot. */
(function () {
  'use strict';
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.__discord) return;
  function nulla() {}
  var bottone = {show: nulla, hide: nulla, onClick: nulla, offClick: nulla, setText: nulla, enable: nulla, disable: nulla,
                 showProgress: nulla, hideProgress: nulla, setParams: nulla, isVisible: false};
  window.Telegram = {WebApp: {
    __discord: true, initData: '', initDataUnsafe: {}, platform: 'discord', version: '0',
    colorScheme: 'dark', themeParams: {bg_color: '#000000', text_color: '#f2f2f4', button_color: '#8b83f0'},
    isExpanded: true, viewportHeight: innerHeight, viewportStableHeight: innerHeight,
    ready: nulla, expand: nulla, close: nulla, enableClosingConfirmation: nulla, disableClosingConfirmation: nulla,
    disableVerticalSwipes: nulla, setHeaderColor: nulla, setBackgroundColor: nulla, onEvent: nulla, offEvent: nulla,
    openLink: nulla, openTelegramLink: nulla, sendData: nulla, showAlert: function (t, cb) { if (cb) cb(); },
    showConfirm: function (t, cb) { if (cb) cb(true); },
    HapticFeedback: {impactOccurred: nulla, notificationOccurred: nulla, selectionChanged: nulla},
    BackButton: bottone, MainButton: bottone, SecondaryButton: bottone, SettingsButton: bottone,
    CloudStorage: {getItem: function (k, cb) { if (cb) cb(null, ''); }, setItem: function (k, v, cb) { if (cb) cb(null, true); }}
  }};
})();
