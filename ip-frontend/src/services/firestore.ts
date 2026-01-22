import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../util/firebase";
import type { AdminUser } from "../types";
import { FIRESTORE_PATHS } from "../types";
import type { Candidate, Question, EvaluationTemplate, EvaluationSession } from "../types";

// ============= AUTH SERVICES =============

export const createAdminUser = async (email: string, displayName: string): Promise<AdminUser> => {
  const userId = email.replace(/[^a-zA-Z0-9]/g, "_");
  const adminUser: AdminUser = {
    id: userId,
    email,
    displayName,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, FIRESTORE_PATHS.ADMINS, userId), {
    ...adminUser,
    createdAt: adminUser.createdAt.toISOString(),
    updatedAt: adminUser.updatedAt.toISOString(),
  });

  return adminUser;
};

export const getAdminUserByEmail = async (email: string): Promise<AdminUser | null> => {
  const q = query(collection(db, FIRESTORE_PATHS.ADMINS), where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as AdminUser;
};

// ============= CANDIDATE SERVICES =============

export const createCandidate = async (
  adminId: string,
  email: string,
  name: string
): Promise<Candidate> => {
  const candidateId = `${adminId}_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
  const candidate: Candidate = {
    id: candidateId,
    email,
    name,
    adminId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, FIRESTORE_PATHS.CANDIDATES, candidateId), {
    ...candidate,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
  });

  return candidate;
};

export const getCandidatesByAdminId = async (adminId: string): Promise<Candidate[]> => {
  const q = query(collection(db, FIRESTORE_PATHS.CANDIDATES), where("adminId", "==", adminId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as Candidate;
  });
};

export const updateCandidate = async (candidateId: string, updates: Partial<Candidate>) => {
  await updateDoc(doc(db, FIRESTORE_PATHS.CANDIDATES, candidateId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteCandidate = async (candidateId: string) => {
  await deleteDoc(doc(db, FIRESTORE_PATHS.CANDIDATES, candidateId));
};;

export const subscribeToCandidates = (adminId: string, callback: (candidates: Candidate[]) => void): Unsubscribe => {
  const q = query(collection(db, FIRESTORE_PATHS.CANDIDATES), where("adminId", "==", adminId));
  return onSnapshot(q, (snapshot) => {
    const candidates = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as Candidate;
    });
    callback(candidates);
  });
};

// ============= QUESTION SERVICES =============

export const createQuestion = async (
  adminId: string,
  title: string,
  content: string
): Promise<Question> => {
  const questionRef = doc(collection(db, FIRESTORE_PATHS.QUESTIONS));
  const question: Question = {
    id: questionRef.id,
    title,
    content,
    adminId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(questionRef, {
    ...question,
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt.toISOString(),
  });

  return question;
};

export const getQuestionsByAdminId = async (adminId: string): Promise<Question[]> => {
  const q = query(collection(db, FIRESTORE_PATHS.QUESTIONS), where("adminId", "==", adminId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as Question;
  });
};

export const getQuestionById = async (questionId: string): Promise<Question | null> => {
  const docSnap = await getDoc(doc(db, FIRESTORE_PATHS.QUESTIONS, questionId));

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Question;
};

export const updateQuestion = async (questionId: string, updates: Partial<Question>) => {
  await updateDoc(doc(db, FIRESTORE_PATHS.QUESTIONS, questionId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteQuestion = async (questionId: string) => {
  await deleteDoc(doc(db, FIRESTORE_PATHS.QUESTIONS, questionId));
};

export const subscribeToQuestions = (adminId: string, callback: (questions: Question[]) => void): Unsubscribe => {
  const q = query(collection(db, FIRESTORE_PATHS.QUESTIONS), where("adminId", "==", adminId));
  return onSnapshot(q, (snapshot) => {
    const questions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as Question;
    });
    callback(questions);
  });
};

// ============= TEMPLATE SERVICES =============

export const createTemplate = async (
  adminId: string,
  name: string,
  description: string,
  questionIds: string[]
): Promise<EvaluationTemplate> => {
  const templateRef = doc(collection(db, FIRESTORE_PATHS.TEMPLATES));
  const template: EvaluationTemplate = {
    id: templateRef.id,
    name,
    description,
    adminId,
    questionIds,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(templateRef, {
    ...template,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
  });

  return template;
};

export const getTemplatesByAdminId = async (adminId: string): Promise<EvaluationTemplate[]> => {
  const q = query(collection(db, FIRESTORE_PATHS.TEMPLATES), where("adminId", "==", adminId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as EvaluationTemplate;
  });
};

export const getTemplateById = async (templateId: string): Promise<EvaluationTemplate | null> => {
  const docSnap = await getDoc(doc(db, FIRESTORE_PATHS.TEMPLATES, templateId));

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as EvaluationTemplate;
};

export const updateTemplate = async (templateId: string, updates: Partial<EvaluationTemplate>) => {
  await updateDoc(doc(db, FIRESTORE_PATHS.TEMPLATES, templateId), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteTemplate = async (templateId: string) => {
  await deleteDoc(doc(db, FIRESTORE_PATHS.TEMPLATES, templateId));
};

export const subscribeToTemplates = (adminId: string, callback: (templates: EvaluationTemplate[]) => void): Unsubscribe => {
  const q = query(collection(db, FIRESTORE_PATHS.TEMPLATES), where("adminId", "==", adminId));
  return onSnapshot(q, (snapshot) => {
    const templates = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as EvaluationTemplate;
    });
    callback(templates);
  });
};

// ============= SESSION SERVICES =============

export const createSession = async (
  adminId: string,
  candidateId: string,
  template: EvaluationTemplate,
  questions: Question[]
): Promise<EvaluationSession> => {
  const sessionRef = doc(collection(db, FIRESTORE_PATHS.SESSIONS));
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + 2 * 60 * 60 * 1000); // 2 hours

  const sessionQuestions = questions.map((q, index) => ({
    id: q.id,
    title: q.title,
    content: q.content,
    order: index,
  }));

  const session: EvaluationSession = {
    id: sessionRef.id,
    adminId,
    candidateId,
    templateId: template.id,
    questions: sessionQuestions,
    status: "active",
    startedAt,
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(sessionRef, {
    ...session,
    startedAt: session.startedAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  });

  return session;
};

export const getSessionsByAdminId = async (adminId: string): Promise<EvaluationSession[]> => {
  const q = query(collection(db, FIRESTORE_PATHS.SESSIONS), where("adminId", "==", adminId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      startedAt: new Date(data.startedAt),
      expiresAt: new Date(data.expiresAt),
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
    } as EvaluationSession;
  });
};

export const getSessionById = async (sessionId: string): Promise<EvaluationSession | null> => {
  const docSnap = await getDoc(doc(db, FIRESTORE_PATHS.SESSIONS, sessionId));

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    ...data,
    id: docSnap.id,
    startedAt: new Date(data.startedAt),
    expiresAt: new Date(data.expiresAt),
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
  } as EvaluationSession;
};

export const updateSession = async (sessionId: string, updates: Partial<EvaluationSession>) => {
  const updateData: any = { ...updates };
  if (updates.startedAt) updateData.startedAt = updates.startedAt.toISOString();
  if (updates.expiresAt) updateData.expiresAt = updates.expiresAt.toISOString();
  if (updates.completedAt) updateData.completedAt = updates.completedAt.toISOString();
  updateData.updatedAt = new Date().toISOString();

  await updateDoc(doc(db, FIRESTORE_PATHS.SESSIONS, sessionId), updateData);
};

export const deleteSession = async (sessionId: string) => {
  await deleteDoc(doc(db, FIRESTORE_PATHS.SESSIONS, sessionId));
};

export const subscribeToSession = (sessionId: string, callback: (session: EvaluationSession) => void): Unsubscribe => {
  return onSnapshot(doc(db, FIRESTORE_PATHS.SESSIONS, sessionId), (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const session = {
        ...data,
        id: doc.id,
        startedAt: new Date(data.startedAt),
        expiresAt: new Date(data.expiresAt),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      } as EvaluationSession;
      callback(session);
    }
  });
};
