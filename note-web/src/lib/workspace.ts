import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    orderBy,
    deleteDoc
} from "firebase/firestore";

export interface Workspace {
    id: string;
    name: string;
    ownerId: string;
    members: string[];
    createdAt?: any;
}

export interface Page {
    id: string;
    workspaceId: string;
    parentId: string | null;
    title: string;
    icon?: string;
    cover?: string;
    content?: string; // HTML content from Tiptap
    createdAt?: any;
    updatedAt?: any;
    isExpanded?: boolean; // For sidebar UI state (local only, but defined here for type)
}

// --- Workspaces ---

export async function createWorkspace(ownerId: string, name: string): Promise<Workspace> {
    const docRef = await addDoc(collection(db, "workspaces"), {
        ownerId,
        name,
        members: [ownerId],
        createdAt: serverTimestamp()
    });
    return { id: docRef.id, ownerId, name, members: [ownerId] };
}

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const q = query(collection(db, "workspaces"), where("members", "array-contains", userId));
    const snapshot = await getDocs(q);

    const workspaces: Workspace[] = [];
    snapshot.forEach(doc => {
        workspaces.push({ id: doc.id, ...doc.data() } as Workspace);
    });

    return workspaces;
}

// --- Pages ---

export async function createPage(workspaceId: string, parentId: string | null = null, title: string = "Untitled"): Promise<Page> {
    const docRef = await addDoc(collection(db, "pages"), {
        workspaceId,
        parentId,
        title,
        content: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    });

    return {
        id: docRef.id,
        workspaceId,
        parentId,
        title,
        content: ""
    };
}

export async function getWorkspacePages(workspaceId: string): Promise<Page[]> {
    // Determine sort algorithm - for now create time
    const q = query(
        collection(db, "pages"),
        where("workspaceId", "==", workspaceId)
    );
    // Note: composite index may be required for workspaceId + orderBy together later.

    const snapshot = await getDocs(q);
    const pages: Page[] = [];
    snapshot.forEach(doc => {
        pages.push({ id: doc.id, ...doc.data() } as Page);
    });

    return pages;
}

export async function getPage(pageId: string): Promise<Page | null> {
    const docRef = doc(db, "pages", pageId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Page;
    }
    return null;
}

export async function updatePage(pageId: string, data: Partial<Page>) {
    const docRef = doc(db, "pages", pageId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deletePage(pageId: string) {
    // Note: This needs to recursively delete children in a real production app.
    // For MVP, we just delete the node. Children become orphans (or hidden).
    await deleteDoc(doc(db, "pages", pageId));
}
