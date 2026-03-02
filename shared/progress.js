/**
 * Studieplan Stijn – Shared Progress API
 * 
 * Elke trainer gebruikt dit om voortgang op te slaan.
 * Dashboard leest alle trainer_* keys om voortgang te tonen.
 * 
 * Usage in trainer:
 *   <script src="../../shared/progress.js"></script>
 *   const progress = new TrainerProgress("nederlands_1.3", "Nederlands par 1.3");
 *   progress.updateSection("titel_tussenkopje", { correct: 5, total: 7, theoryDone: true });
 *   progress.getSection("titel_tussenkopje"); // { correct, total, theoryDone, bestStreak }
 * 
 * Usage in dashboard:
 *   <script src="shared/progress.js"></script>
 *   const all = TrainerProgress.getAllTrainers(); // [{ key, meta, sections }]
 */

class TrainerProgress {
  constructor(trainerId, displayName, opts = {}) {
    this.key = "trainer_" + trainerId;
    this.displayName = displayName;
    this.subject = opts.subject || displayName;
    this.color = opts.color || "#4d96ff";
    this.icon = opts.icon || "📚";
    this._load();
    this._pullFromFirebase();
  }

  _load() {
    try {
      const raw = localStorage.getItem(this.key);
      this.data = raw ? JSON.parse(raw) : this._default();
    } catch { this.data = this._default(); }
  }

  _default() {
    return {
      meta: { displayName: this.displayName, subject: this.subject, color: this.color, icon: this.icon },
      sections: {},
      lastUpdated: null
    };
  }

  _save() {
    this.data.lastUpdated = new Date().toISOString();
    this.data.meta = { displayName: this.displayName, subject: this.subject, color: this.color, icon: this.icon };
    try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch {}
    if(window.FB) window.FB.syncToFirebase(window.FB.trainerRef(this.key),this.data);
  }

  _pullFromFirebase(){
    if(!window.FB)return;
    const self=this;
    window.FB.pullFromFirebase(window.FB.trainerRef(self.key),self.key,()=>{
      self._load();
      if(typeof self._onUpdate==="function")self._onUpdate();
    });
  }

  onUpdate(fn){this._onUpdate=fn;}

  // Get section data
  getSection(sectionId) {
    return this.data.sections[sectionId] || { correct: 0, total: 0, theoryDone: false, bestStreak: 0 };
  }

  // Update section (merges with existing)
  updateSection(sectionId, updates) {
    const current = this.getSection(sectionId);
    this.data.sections[sectionId] = { ...current, ...updates };
    this._save();
  }

  // Mark theory as done
  markTheoryDone(sectionId) {
    this.updateSection(sectionId, { theoryDone: true });
  }

  // Record a practice answer
  recordAnswer(sectionId, isCorrect) {
    const s = this.getSection(sectionId);
    s.total++;
    if (isCorrect) {
      s.correct++;
      s.currentStreak = (s.currentStreak || 0) + 1;
      s.bestStreak = Math.max(s.bestStreak || 0, s.currentStreak);
    } else {
      s.currentStreak = 0;
    }
    this.data.sections[sectionId] = s;
    this._save();
  }

  // Check if section is mastered (≥5 answers, ≥70% correct)
  isMastered(sectionId) {
    const s = this.getSection(sectionId);
    return s.total >= 5 && s.correct / s.total >= 0.7;
  }

  // Get overall stats
  getOverallStats() {
    const sectionIds = Object.keys(this.data.sections);
    const totalSections = sectionIds.length;
    let mastered = 0, theoryDone = 0, totalCorrect = 0, totalAnswered = 0;
    sectionIds.forEach(id => {
      const s = this.data.sections[id];
      if (this.isMastered(id)) mastered++;
      if (s.theoryDone) theoryDone++;
      totalCorrect += s.correct || 0;
      totalAnswered += s.total || 0;
    });
    return {
      totalSections, mastered, theoryDone, totalCorrect, totalAnswered,
      accuracy: totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0,
      masteryPct: totalSections > 0 ? Math.round(mastered / totalSections * 100) : 0
    };
  }

  // Reset all data
  reset() {
    this.data = this._default();
    this._save();
  }

  // Static: get all trainer data from localStorage
  static getAllTrainers() {
    const trainers = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("trainer_")) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.meta) {
            trainers.push({ key, ...data });
          }
        } catch {}
      }
    }
    return trainers;
  }

  // Static: get trainer by key
  static getTrainer(trainerId) {
    try {
      const raw = localStorage.getItem("trainer_" + trainerId);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.TrainerProgress = TrainerProgress;
}
