/**
 * marks.js — Result Management System (Firebase Version)
 * Architecture: Service-layer pattern using Firebase Firestore & Auth.
 * Enables real-time collaboration across devices.
 */

const MAX_EDITS = 3;

// ─────────────────────────────────────────────
// AUTH SERVICE
// ─────────────────────────────────────────────
const AuthService = {
    currentUser: null,

    async login(email, password) {
        try {
            let userCredential;
            try {
                // Try to sign in first
                userCredential = await auth.signInWithEmailAndPassword(email, password);
            } catch (signInError) {
                // If user not found, try to create account (helper for first login)
                if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
                    userCredential = await auth.createUserWithEmailAndPassword(email, password);
                } else {
                    throw signInError;
                }
            }

            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            
            if (!userDoc.exists) {
                // Setup user profile
                const role = email.toLowerCase().includes('admin') ? 'admin' : 'teacher';
                const profile = {
                    name: email.split('@')[0],
                    email: email,
                    role: role,
                    subjectIds: []
                };
                await db.collection('users').doc(userCredential.user.uid).set(profile);
                this.currentUser = { id: userCredential.user.uid, ...profile };
            } else {
                this.currentUser = { id: userCredential.user.uid, ...userDoc.data() };
            }
            return this.currentUser;
        } catch (error) {
            console.error("Login error:", error);
            throw new Error(error.message);
        }
    },

    async logout() {
        await auth.signOut();
        this.currentUser = null;
    },

    async checkAuthState() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    this.currentUser = { id: user.uid, ...userDoc.data() };
                    resolve(this.currentUser);
                } else {
                    this.currentUser = null;
                    resolve(null);
                }
            });
        });
    },

    requireAuth() {
        if (!this.currentUser) throw new Error('Authentication required.');
    },

    requireAdmin() {
        this.requireAuth();
        if (this.currentUser.role !== 'admin') throw new Error('Admin privileges required.');
    }
};

// ─────────────────────────────────────────────
// MARKS SERVICE
// ─────────────────────────────────────────────
const MarksService = {
    
    async getSubjects() {
        const snap = await db.collection('subjects').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getMySubjects() {
        AuthService.requireAuth();
        const all = await this.getSubjects();
        if (AuthService.currentUser.role === 'admin') return all;
        return all.filter(s => AuthService.currentUser.subjectIds.includes(s.id));
    },

    async getStudents() {
        const snap = await db.collection('students').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getAllMarks() {
        const snap = await db.collection('marks').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addMark({ studentId, subjectId, score }) {
        AuthService.requireAuth();
        const mark = {
            studentId,
            subjectId,
            score: parseInt(score),
            maxScore: 100,
            editCount: 1,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: AuthService.currentUser.id
        };
        return await db.collection('marks').add(mark);
    },

    async editMark(markId, newScore) {
        AuthService.requireAuth();
        const markRef = db.collection('marks').doc(markId);
        const doc = await markRef.get();
        if (!doc.exists) throw new Error('Mark record not found.');
        
        const data = doc.data();
        if (data.editCount >= MAX_EDITS) throw new Error(`Maximum edit limit (${MAX_EDITS}) reached.`);

        await markRef.update({
            score: parseInt(newScore),
            editCount: firebase.firestore.FieldValue.increment(1),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            updatedBy: AuthService.currentUser.id
        });
    },

    async findMark(studentId, subjectId) {
        const snap = await db.collection('marks')
            .where('studentId', '==', studentId)
            .where('subjectId', '==', subjectId)
            .limit(1)
            .get();
        return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
    },

    async addSubject({ name, code }) {
        AuthService.requireAdmin();
        const doc = await db.collection('subjects').add({
            name,
            code: code.toUpperCase()
        });
        return { id: doc.id, name, code };
    },

    async addStudent({ name, rollNumber, className, photo, sex }) {
        AuthService.requireAdmin();
        const student = {
            name,
            rollNumber,
            class: className,
            sex,
            photo: photo || `https://ui-avatars.com/api/?background=random&color=fff&name=${encodeURIComponent(name)}`
        };
        const doc = await db.collection('students').add(student);
        return { id: doc.id, ...student };
    },

    async deleteSubject(id) {
        AuthService.requireAdmin();
        await db.collection('subjects').doc(id).delete();
        // Clean up marks (Note: In production, use a Cloud Function for this)
        const marks = await db.collection('marks').where('subjectId', '==', id).get();
        const batch = db.batch();
        marks.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    },

    async deleteStudent(id) {
        AuthService.requireAdmin();
        await db.collection('students').doc(id).delete();
        // Clean up marks
        const marks = await db.collection('marks').where('studentId', '==', id).get();
        const batch = db.batch();
        marks.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    },

    async getTeachers() {
        AuthService.requireAdmin();
        const snap = await db.collection('users').where('role', '==', 'teacher').get();
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async assignTeacherToSubject(userId, subjectId) {
        AuthService.requireAdmin();
        await db.collection('users').doc(userId).update({
            subjectIds: firebase.firestore.FieldValue.arrayUnion(subjectId)
        });
    },

    editsRemaining(mark) {
        return Math.max(0, MAX_EDITS - (mark ? mark.editCount : 0));
    }
};
