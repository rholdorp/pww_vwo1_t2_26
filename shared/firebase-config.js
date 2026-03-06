(function(){
  const FIREBASE_CONFIG={
    apiKey:"AIzaSyD34zmb2CbSxXxcsVajOMDUrchSO9Uh5TE",
    authDomain:"pww-vwo1-t2-26.firebaseapp.com",
    databaseURL:"https://pww-vwo1-t2-26-default-rtdb.europe-west1.firebasedatabase.app",
    projectId:"pww-vwo1-t2-26",
    storageBucket:"pww-vwo1-t2-26.firebasestorage.app",
    messagingSenderId:"826046770617",
    appId:"1:826046770617:web:e370643ad2fac668c19a68"
  };
  firebase.initializeApp(FIREBASE_CONFIG);
  const db=firebase.database();

  const USER_KEY="stijn_active_user_v1";
  function getCurrentUser(){return localStorage.getItem(USER_KEY)||"stijn";}
  function setCurrentUser(name){
    const safe=name.toLowerCase().replace(/[^a-z0-9-]/g,"");
    if(!safe)return null;
    localStorage.setItem(USER_KEY,safe);
    return safe;
  }

  // Firebase key: vervang . door , (Firebase verbiedt punten in keys)
  function trainerRef(localKey){
    return db.ref("users/"+getCurrentUser()+"/trainers/"+localKey.replace(/\./g,","));
  }
  function studiePlanRef(user){
    return db.ref("users/"+(user||getCurrentUser())+"/studieplan");
  }

  // Debounced write — fire-and-forget
  const _timers={};
  function syncToFirebase(ref,data,ms){
    const k=ref.toString();
    clearTimeout(_timers[k]);
    _timers[k]=setTimeout(()=>{
      ref.set(data).catch(e=>console.warn("[FB] sync failed:",e.message));
    },ms||1500);
  }

  // Pull once: als Firebase nieuwer is → overschrijf localStorage + callback
  function pullFromFirebase(ref,localKey,callback){
    ref.once("value").then(snap=>{
      if(!snap.exists())return;
      const fb=snap.val();
      if(!fb)return;
      try{
        const loc=JSON.parse(localStorage.getItem(localKey)||"null");
        const fbTs=fb.lastUpdated||fb._lastUpdated||"";
        const locTs=(loc&&(loc.lastUpdated||loc._lastUpdated))||"";
        if(fbTs>locTs){
          localStorage.setItem(localKey,JSON.stringify(fb));
          if(callback)callback(fb);
        }
      }catch{}
    }).catch(e=>console.warn("[FB] pull failed:",e.message));
  }

  function listUsers(){
    return db.ref("users").once("value").then(snap=>{
      if(!snap.exists())return[];
      return Object.keys(snap.val());
    }).catch(()=>[]);
  }

  window.FB={db,getCurrentUser,setCurrentUser,trainerRef,studiePlanRef,
             syncToFirebase,pullFromFirebase,listUsers};
})();
