/**
 * StudyCamera — foto's maken bij start/einde training
 * Vraagt altijd toestemming aan de gebruiker.
 * Slaat foto's op in IndexedDB (per browser).
 */
class StudyCamera {
  static DB_NAME = "studycam_photos";
  static DB_VERSION = 1;
  static STORE = "photos";

  static _openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(StudyCamera.DB_NAME, StudyCamera.DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(StudyCamera.STORE)) {
          const store = db.createObjectStore(StudyCamera.STORE, { keyPath: "id", autoIncrement: true });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("trainer", "trainer");
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  static async savePhoto(blob, metadata) {
    const db = await StudyCamera._openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(StudyCamera.STORE, "readwrite");
      tx.objectStore(StudyCamera.STORE).add({
        timestamp: Date.now(),
        date: new Date().toISOString(),
        blob: blob,
        ...metadata
      });
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  static async getPhotos(limit) {
    limit = limit || 100;
    const db = await StudyCamera._openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(StudyCamera.STORE, "readonly");
      const idx = tx.objectStore(StudyCamera.STORE).index("timestamp");
      const photos = [];
      const req = idx.openCursor(null, "prev");
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor && photos.length < limit) {
          photos.push(cursor.value);
          cursor.continue();
        } else { db.close(); resolve(photos); }
      };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }

  static async getPhotoCount() {
    const db = await StudyCamera._openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(StudyCamera.STORE, "readonly");
      const req = tx.objectStore(StudyCamera.STORE).count();
      req.onsuccess = () => { db.close(); resolve(req.result); };
      req.onerror = () => { db.close(); resolve(0); };
    });
  }

  /**
   * Toont een modal die vraagt of de gebruiker een foto wil maken.
   * @param {string} trainer - naam van de trainer
   * @param {string} event - "start" of "end"
   * @returns {Promise<boolean>} true als foto gemaakt, false als geweigerd
   */
  static requestPhoto(trainer, event) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;font-family:Nunito,sans-serif";

      const modal = document.createElement("div");
      modal.style.cssText = "background:#1a2035;border-radius:16px;padding:24px;max-width:340px;width:90%;text-align:center;border:1px solid rgba(255,255,255,0.1)";

      const title = event === "start" ? "Training gestart!" : "Training afgerond!";
      const sub = event === "start"
        ? "Je begint met <b>" + trainer + "</b>.<br>Mogen we een foto maken voor het logboek?"
        : "Goed gedaan bij <b>" + trainer + "</b>!<br>Foto maken voor het logboek?";

      modal.innerHTML =
        '<div style="font-size:36px;margin-bottom:10px">' + (event === "start" ? "📸" : "🎉📸") + '</div>' +
        '<div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:6px">' + title + '</div>' +
        '<div style="font-size:13px;color:#999;margin-bottom:20px;line-height:1.5">' + sub + '</div>' +
        '<div id="sc-preview" style="display:none;margin-bottom:16px;border-radius:12px;overflow:hidden"></div>' +
        '<div id="sc-btns" style="display:flex;gap:10px;justify-content:center">' +
          '<button id="sc-no" style="flex:1;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#999;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Nee, bedankt</button>' +
          '<button id="sc-yes" style="flex:1;padding:12px;border-radius:10px;border:none;background:#4d96ff;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Ja!</button>' +
        '</div>';

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      var stream = null;
      var cleanup = function() {
        if (stream) stream.getTracks().forEach(function(t) { t.stop(); });
        overlay.remove();
      };

      modal.querySelector("#sc-no").onclick = function() { cleanup(); resolve(false); };

      modal.querySelector("#sc-yes").onclick = function() {
        navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
        }).then(function(s) {
          stream = s;
          var preview = modal.querySelector("#sc-preview");
          preview.style.display = "block";

          var video = document.createElement("video");
          video.srcObject = stream;
          video.autoplay = true;
          video.playsInline = true;
          video.muted = true;
          video.style.cssText = "width:100%;border-radius:12px;transform:scaleX(-1)";
          preview.appendChild(video);

          var btns = modal.querySelector("#sc-btns");
          btns.innerHTML =
            '<button id="sc-cancel" style="flex:1;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.05);color:#999;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Annuleer</button>' +
            '<button id="sc-snap" style="flex:1;padding:12px;border-radius:10px;border:none;background:#6bcb77;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">\uD83D\uDCF8 Foto!</button>';

          btns.querySelector("#sc-cancel").onclick = function() { cleanup(); resolve(false); };
          btns.querySelector("#sc-snap").onclick = function() {
            var canvas = document.createElement("canvas");
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            var ctx = canvas.getContext("2d");
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0);

            canvas.toBlob(function(blob) {
              StudyCamera.savePhoto(blob, {
                trainer: trainer,
                event: event,
                user: (window.FB && window.FB.getCurrentUser) ? window.FB.getCurrentUser() : "stijn"
              }).then(function() {
                // Flash effect
                preview.style.transition = "opacity 0.15s";
                preview.style.opacity = "0.3";
                setTimeout(function() {
                  preview.style.opacity = "1";
                  setTimeout(function() { cleanup(); resolve(true); }, 400);
                }, 150);
              }).catch(function() { cleanup(); resolve(false); });
            }, "image/jpeg", 0.75);
          };

          video.play().catch(function() {});
        }).catch(function(err) {
          var preview = modal.querySelector("#sc-preview");
          preview.style.display = "block";
          preview.innerHTML = '<div style="padding:20px;color:#ff6b6b;font-size:13px">Camera niet beschikbaar:<br>' + err.message + '</div>';
          setTimeout(function() { cleanup(); resolve(false); }, 2500);
        });
      };
    });
  }
}

if (typeof window !== "undefined") {
  window.StudyCamera = StudyCamera;
}
