/**
 * marks.js — Result Management System (Student Marks)
 * Architecture: Service-layer pattern with localStorage data store.
 * All business rules (access control, edit limits, validation) are enforced
 * here so the UI cannot bypass them — mirroring a real backend API boundary.
 *
 * To migrate to a real backend, replace each service method with a fetch() call.
 */

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const DB_KEY       = 'marks_mgmt_db';
const SESSION_KEY  = 'marks_session';
const MAX_EDITS    = 3;
const SCORE_MIN    = 0;
const SCORE_MAX    = 100;

// ─────────────────────────────────────────────
// CRYPTO HELPERS (lightweight for demo)
// ─────────────────────────────────────────────
const Crypto = {
  /** Simple deterministic hash — replace with bcrypt on a real server */
  hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return 'h' + Math.abs(h).toString(16);
  },
  uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
};

// ─────────────────────────────────────────────
// DATA STORE — localStorage wrapper
// ─────────────────────────────────────────────
const Store = {
  _db: null,

  load() {
    try {
      this._db = JSON.parse(localStorage.getItem(DB_KEY)) || null;
    } catch { this._db = null; }
    if (!this._db) this._seed();
    return this;
  },

  save() {
    localStorage.setItem(DB_KEY, JSON.stringify(this._db));
  },

  get() { return this._db; },

  /** Pre-populate demo data so the system works out of the box */
  _seed() {
    const subjects = [
      { id: 's1', name: 'Mathematics',       code: 'MATH' },
      { id: 's2', name: 'English Language',  code: 'ENG'  },
      { id: 's3', name: 'Computer Science',  code: 'CS'   },
      { id: 's4', name: 'Biology',           code: 'BIO'  },
    ];

    const users = [
      {
        id: 'u0', name: 'Class Teacher', email: 'admin@school.io',
        passwordHash: Crypto.hash('admin123'),
        role: 'admin', subjectIds: []
      },
      {
        id: 'u1', name: 'Mr. Benson (Math)',      email: 'math@school.io',
        passwordHash: Crypto.hash('math123'),
        role: 'teacher', subjectIds: ['s1']
      },
      {
        id: 'u2', name: 'Ms. Grace (English)',    email: 'eng@school.io',
        passwordHash: Crypto.hash('eng123'),
        role: 'teacher', subjectIds: ['s2']
      },
      {
        id: 'u3', name: 'Mr. James (CS)',         email: 'cs@school.io',
        passwordHash: Crypto.hash('cs123'),
        role: 'teacher', subjectIds: ['s3']
      },
      {
        id: 'u4', name: 'Ms. Acacia (Biology)',   email: 'bio@school.io',
        passwordHash: Crypto.hash('bio123'),
        role: 'teacher', subjectIds: ['s4']
      },
    ];

    const defaultAvatar = 'https://ui-avatars.com/api/?background=random&color=fff&name=';
    const students = [
      { id: 'st1', name: 'Ayen Deng',       rollNumber: '001', class: 'Form 4A', photo: defaultAvatar + 'Ayen+Deng' },
      { id: 'st2', name: 'Lual Garang',     rollNumber: '002', class: 'Form 4A', photo: defaultAvatar + 'Lual+Garang' },
      { id: 'st3', name: 'Nyakim Kuol',     rollNumber: '003', class: 'Form 4A', photo: defaultAvatar + 'Nyakim+Kuol' },
      { id: 'st4', name: 'Machar Dut',      rollNumber: '004', class: 'Form 4A', photo: defaultAvatar + 'Machar+Dut' },
      { id: 'st5', name: 'Achol Maker',     rollNumber: '005', class: 'Form 4A', photo: defaultAvatar + 'Achol+Maker' },
      { id: 'st6', name: 'Deng Mabior',     rollNumber: '006', class: 'Form 4A', photo: defaultAvatar + 'Deng+Mabior' },
    ];

    // Seed some initial marks
    const now = new Date().toISOString();
    const marks = [
      { id: Crypto.uuid(), studentId: 'st1', subjectId: 's1', teacherId: 'u1', score: 82, maxScore: 100, editCount: 1, createdAt: now, updatedAt: now },
      { id: Crypto.uuid(), studentId: 'st2', subjectId: 's1', teacherId: 'u1', score: 74, maxScore: 100, editCount: 0, createdAt: now, updatedAt: now },
      { id: Crypto.uuid(), studentId: 'st1', subjectId: 's2', teacherId: 'u2', score: 90, maxScore: 100, editCount: 2, createdAt: now, updatedAt: now },
      { id: Crypto.uuid(), studentId: 'st2', subjectId: 's2', teacherId: 'u2', score: 66, maxScore: 100, editCount: 3, createdAt: now, updatedAt: now },
      { id: Crypto.uuid(), studentId: 'st3', subjectId: 's3', teacherId: 'u3', score: 88, maxScore: 100, editCount: 0, createdAt: now, updatedAt: now },
    ];

    this._db = { users, subjects, students, marks };
    this.save();
  }
};

// ─────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────
const AuthService = {
  /**
   * Authenticate a user by email + password.
   * @returns {object} session token payload, or throws Error.
   */
  login(email, password) {
    Store.load();
    const db   = Store.get();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== Crypto.hash(password)) {
      throw new Error('Invalid email or password.');
    }
    const session = {
      userId:     user.id,
      name:       user.name,
      role:       user.role,
      subjectIds: user.subjectIds,
      token:      Crypto.uuid(),
      issuedAt:   Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },

  /** Returns the current session or null. */
  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
    } catch { return null; }
  },

  /** Throws if not authenticated. */
  requireAuth() {
    const s = this.getSession();
    if (!s) throw new Error('Not authenticated. Please log in.');
    return s;
  },

  /** Throws if not admin. */
  requireAdmin() {
    const s = this.requireAuth();
    if (s.role !== 'admin') throw new Error('Forbidden: admin access required.');
    return s;
  },

  /** Throws if teacher doesn't own the subject. */
  requireSubjectAccess(subjectId) {
    const s = this.requireAuth();
    if (s.role === 'admin') return s;              // admins can read all
    if (!s.subjectIds.includes(subjectId)) {
      throw new Error('Forbidden: you are not assigned to this subject.');
    }
    return s;
  }
};

// ─────────────────────────────────────────────
// MARKS SERVICE
// ─────────────────────────────────────────────
const MarksService = {

  /** Returns all subjects (safe to expose to all roles). */
  getSubjects() {
    AuthService.requireAuth();
    return Store.load().get().subjects;
  },

  /** Returns subjects the current teacher is assigned to. */
  getMySubjects() {
    const s = AuthService.requireAuth();
    const db = Store.load().get();
    if (s.role === 'admin') return db.subjects;
    return db.subjects.filter(sub => s.subjectIds.includes(sub.id));
  },

  /** Returns all students. Access control is at the mark level, not student. */
  getStudents() {
    AuthService.requireAuth();
    return Store.load().get().students;
  },

  /**
   * Returns marks for a given subject, enforcing ownership.
   * Admins can call with any subjectId; teachers must own it.
   */
  getMarksBySubject(subjectId) {
    const s = AuthService.requireSubjectAccess(subjectId);
    const db = Store.load().get();
    return db.marks.filter(m => m.subjectId === subjectId);
  },

  /**
   * For admin: returns all marks, grouped by subject.
   */
  getAllMarks() {
    AuthService.requireAdmin();
    return Store.load().get().marks;
  },

  /**
   * Add a new mark for a student in a subject.
   * @throws if teacher doesn't own subject, score out of range, or mark already exists.
   */
  addMark({ studentId, subjectId, score, maxScore = 100 }) {
    const s = AuthService.requireSubjectAccess(subjectId);
    if (s.role === 'admin') throw new Error('Admins cannot add marks.');

    this._validateScore(score, maxScore);

    Store.load();
    const db = Store.get();

    const existing = db.marks.find(
      m => m.studentId === studentId && m.subjectId === subjectId
    );
    if (existing) throw new Error('A mark already exists. Use edit to update it.');

    const now  = new Date().toISOString();
    const mark = {
      id: Crypto.uuid(),
      studentId,
      subjectId,
      teacherId: s.userId,
      score: Number(score),
      maxScore: Number(maxScore),
      editCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    db.marks.push(mark);
    Store.save();
    return mark;
  },

  /**
   * Edit an existing mark.
   * @throws if teacher doesn't own subject, edit limit exceeded, or score invalid.
   */
  editMark(markId, score) {
    const s = AuthService.requireAuth();
    if (s.role === 'admin') throw new Error('Admins cannot edit marks.');

    Store.load();
    const db   = Store.get();
    const mark = db.marks.find(m => m.id === markId);

    if (!mark)                            throw new Error('Mark not found.');
    if (mark.teacherId !== s.userId)      throw new Error('Forbidden: you did not create this mark.');
    if (mark.editCount >= MAX_EDITS)      throw new Error(`Edit limit reached (${MAX_EDITS} edits maximum).`);

    this._validateScore(score, mark.maxScore);

    mark.score     = Number(score);
    mark.editCount += 1;
    mark.updatedAt = new Date().toISOString();
    Store.save();
    return mark;
  },

  _validateScore(score, maxScore) {
    const n = Number(score);
    if (isNaN(n))           throw new Error('Score must be a number.');
    if (n < SCORE_MIN)      throw new Error(`Score cannot be below ${SCORE_MIN}.`);
    if (n > maxScore)       throw new Error(`Score cannot exceed max score (${maxScore}).`);
  },

  /** Helper: find a mark for a specific student + subject. */
  findMark(studentId, subjectId) {
    AuthService.requireAuth();
    const db = Store.load().get();
    return db.marks.find(m => m.studentId === studentId && m.subjectId === subjectId) || null;
  },

  /**
   * Add a new subject to the system.
   * Requires Admin role.
   */
  addSubject({ name, code }) {
    AuthService.requireAdmin();
    if (!name || !code) throw new Error('Subject name and code are required.');
    
    Store.load();
    const db = Store.get();
    if (db.subjects.find(s => s.code.toUpperCase() === code.toUpperCase())) {
      throw new Error(`A subject with code ${code} already exists.`);
    }

    const subject = { id: 's' + (db.subjects.length + 1), name, code: code.toUpperCase() };
    db.subjects.push(subject);
    Store.save();
    return subject;
  },

  /**
   * Add a new student to the system.
   * Requires Admin role.
   */
  addStudent({ name, rollNumber, className, photo }) {
    AuthService.requireAdmin();
    if (!name || !rollNumber || !className) throw new Error('Name, roll number, and class are required.');

    Store.load();
    const db = Store.get();
    if (db.students.find(s => s.rollNumber === rollNumber)) {
      throw new Error(`A student with roll number ${rollNumber} already exists.`);
    }

    const student = { 
      id: 'st' + (db.students.length + 1), 
      name, 
      rollNumber, 
      class: className,
      photo: photo || `https://ui-avatars.com/api/?background=random&color=fff&name=${encodeURIComponent(name)}`
    };
    db.students.push(student);
    Store.save();
    return student;
  },

  /**
   * Returns all teacher users.
   * Requires Admin role.
   */
  getTeachers() {
    AuthService.requireAdmin();
    return Store.load().get().users.filter(u => u.role === 'teacher');
  },

  /**
   * Assign a subject to a teacher.
   * Requires Admin role.
   */
  assignTeacherToSubject(userId, subjectId) {
    AuthService.requireAdmin();
    Store.load();
    const db = Store.get();
    const user = db.users.find(u => u.id === userId);
    if (!user) throw new Error('Teacher not found.');
    if (!user.subjectIds.includes(subjectId)) {
      user.subjectIds.push(subjectId);
      Store.save();
    }
    return user;
  },

  /** Returns remaining edits for a mark. */
  editsRemaining(mark) {
    return Math.max(0, MAX_EDITS - (mark ? mark.editCount : 0));
  }
};

// Export for use in marks.html (global scope, IIFE-safe)
window.AuthService  = AuthService;
window.MarksService = MarksService;
window.MAX_EDITS    = MAX_EDITS;
