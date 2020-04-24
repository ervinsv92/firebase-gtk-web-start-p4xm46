// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";

import * as firebaseui from 'firebaseui';

// Document elements
const startRsvpButton = document.getElementById('startSRVP');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

var rsvpListener = null;
var guestbookListener = null;

// Add Firebase project configuration object here
const firebaseConfig = {
  apiKey: "AIzaSyAgzsJgPOt6mV4hXXeMZaOKWBViumZ1zvI",
  authDomain: "fir-web-codelab-a4a3a.firebaseapp.com",
  databaseURL: "https://fir-web-codelab-a4a3a.firebaseio.com",
  projectId: "fir-web-codelab-a4a3a",
  storageBucket: "fir-web-codelab-a4a3a.appspot.com",
  messagingSenderId: "200903993849",
  appId: "1:200903993849:web:5ff15eefb84bfdd567b528"
};

firebase.initializeApp(firebaseConfig);

// FirebaseUI config
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    // Email / Password Provider.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl){
      // Handle sign-in.
      // Return false to avoid redirect.
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(firebase.auth());

startRsvpButton.addEventListener("click", ()=>{
  
  if(firebase.auth().currentUser){
    firebase.auth().signOut();
  }else{
    //inyecta en la seccion del html, la ventana
    ui.start("#firebaseui-auth-container", uiConfig);
  }
})

firebase.auth().onAuthStateChanged((user)=>{
  if(user){
    startRsvpButton.textContent = "LOGOUT";
    guestbookContainer.style.display = "block";
    suscribeGuestbook();
    subscribeCurrentRSVP(user);
  }else{
    guestbookContainer.style.display = "none";
    startRsvpButton.textContent = "RSVP";
    unsubscribeGuestbook();
    unsuscribeCurrentRSVP();
  }


});

//enviar mensaje
form.addEventListener("submit", (e)=>{
  e.preventDefault();

  firebase.firestore().collection("guestbook").add({
    text: input.value,
    timestamp: Date.now(),
    name: firebase.auth().currentUser.displayName,
    userId: firebase.auth().currentUser.uid
  });

  input.value = "";
  return false;
})

function suscribeGuestbook(){
  guestbookListener = firebase.firestore().collection("guestbook")
    .orderBy("timestamp","desc")
    .onSnapshot((snaps) => {
    // Reset page
    guestbook.innerHTML = "";
    // Loop through documents in database
    snaps.forEach((doc) => {
    // Create an HTML entry for each document and add it to the chat
    const entry = document.createElement("p");
    entry.textContent = doc.data().name + ": " + doc.data().text;
    guestbook.appendChild(entry);
    });
    });
}

function unsubscribeGuestbook(){
if (guestbookListener != null)
{
guestbookListener();
guestbookListener = null;
}
};

// Listen to RSVP responses
rsvpYes.onclick = () => {
// Get a reference to the user's document in the attendees collection
const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

// If they RSVP'd yes, save a document with attending: true
userDoc.set({
attending: true
}).catch(console.error)
}

rsvpNo.onclick = () => {
// Get a reference to the user's document in the attendees collection
const userDoc = firebase.firestore().collection('attendees').doc(firebase.auth().currentUser.uid);

// If they RSVP'd yes, save a document with attending: true
userDoc.set({
attending: false
}).catch(console.error)
}

// Listen for attendee list
firebase.firestore()
  .collection('attendees')
  .where("attending", "==", true)
  .onSnapshot(snap => {
  const newAttendeeCount = snap.docs.length;

  numberAttending.innerHTML = newAttendeeCount+' people going';
})

function subscribeCurrentRSVP(user){
  rsvpListener = firebase.firestore()
  .collection('attendees')
  .doc(user.uid)
  .onSnapshot((doc) => {
  if (doc && doc.data()){
  const attendingResponse = doc.data().attending;
  
  // Update css classes for buttons
  if (attendingResponse){
    rsvpYes.className="clicked";
    rsvpNo.className="";
  }
  else{
    rsvpYes.className="";
    rsvpNo.className="clicked";
  }
  }
  });
}

function unsuscribeCurrentRSVP(){
  if (rsvpListener != null)
  {
  rsvpListener();
  rsvpListener = null;
  }
};