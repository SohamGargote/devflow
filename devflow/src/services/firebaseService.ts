import { db } from '../firebase/config';
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
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  QueryConstraint,
  Firestore,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { Project, Issue, Sprint } from '../types';

const PROJECTS_COLLECTION = 'projects';

interface IssueFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  projectId?: string;
  searchTerm?: string;
}

// Initialize check
const checkInitialization = () => {
  if (!db) {
    throw new Error('Firebase is not initialized. Check your configuration.');
  }
};

// Enable offline persistence
try {
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log('Firestore persistence enabled');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      }
    });
} catch (err) {
  console.error('Error enabling persistence:', err);
}

export const firebaseService = {
  // Project operations
  async getProject(projectId: string): Promise<Project | null> {
    try {
      checkInitialization();
      console.log('Getting project:', projectId);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      console.log('Project reference created:', projectRef);
      
      const projectSnap = await getDoc(projectRef);
      console.log('Project snapshot:', projectSnap);
      
      if (!projectSnap.exists()) {
        console.log('Project not found, will create initial project');
        return null;
      }
      
      const projectData = projectSnap.data();
      console.log('Project data:', projectData);
      return projectData as Project;
    } catch (error: any) {
      console.error('Error in getProject:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to access this project. Please check your authentication status and Firestore security rules.');
      } else if (error.code === 'unauthenticated') {
        throw new Error('You must be logged in to access this project.');
      } else if (error.code === 'not-found') {
        throw new Error('Project not found. Please check if the project exists in Firestore.');
      }
      throw error;
    }
  },

  async createProject(project: Project): Promise<void> {
    try {
      checkInitialization();
      console.log('Creating project:', project);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, project.id);
      console.log('Project reference created:', projectRef);
      
      await setDoc(projectRef, project);
      console.log('Project created successfully');
    } catch (error: any) {
      console.error('Error in createProject:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      throw error;
    }
  },

  async updateProject(project: Project): Promise<void> {
    try {
      checkInitialization();
      console.log('Updating project:', project);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, project.id);
      await updateDoc(projectRef, { ...project });
      console.log('Project updated successfully');
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    try {
      checkInitialization();
      console.log('Deleting project:', projectId);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      await deleteDoc(projectRef);
      console.log('Project deleted successfully');
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  },

  // Issue operations
  async addIssue(projectId: string, issue: Issue): Promise<void> {
    try {
      checkInitialization();
      console.log('Adding issue:', issue);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const project = projectSnap.data() as Project;
      const updatedBacklog = [...project.backlog, issue];
      
      await updateDoc(projectRef, { backlog: updatedBacklog });
      console.log('Issue added successfully');
    } catch (error) {
      console.error('Error in addIssue:', error);
      throw error;
    }
  },

  async updateIssue(projectId: string, issue: Issue): Promise<void> {
    try {
      checkInitialization();
      console.log('Updating issue:', issue);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const project = projectSnap.data() as Project;
      
      // Update in backlog
      const updatedBacklog = project.backlog.map(i => 
        i.id === issue.id ? issue : i
      );
      
      // Update in sprints
      const updatedSprints = project.sprints.map(sprint => ({
        ...sprint,
        issues: sprint.issues.map(i => 
          i.id === issue.id ? issue : i
        )
      }));
      
      await updateDoc(projectRef, {
        backlog: updatedBacklog,
        sprints: updatedSprints
      });
      console.log('Issue updated successfully');
    } catch (error) {
      console.error('Error in updateIssue:', error);
      throw error;
    }
  },

  async deleteIssue(projectId: string, issueId: string): Promise<void> {
    try {
      checkInitialization();
      console.log('Deleting issue:', issueId);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const project = projectSnap.data() as Project;
      
      // Remove from backlog
      const updatedBacklog = project.backlog.filter(i => i.id !== issueId);
      
      // Remove from sprints
      const updatedSprints = project.sprints.map(sprint => ({
        ...sprint,
        issues: sprint.issues.filter(i => i.id !== issueId)
      }));
      
      await updateDoc(projectRef, {
        backlog: updatedBacklog,
        sprints: updatedSprints
      });
      console.log('Issue deleted successfully');
    } catch (error) {
      console.error('Error in deleteIssue:', error);
      throw error;
    }
  },

  // Sprint operations
  async addSprint(projectId: string, sprint: Sprint): Promise<void> {
    try {
      checkInitialization();
      console.log('Adding sprint:', sprint);
      
      if (!projectId || typeof projectId !== 'string') {
        console.error('Invalid project ID:', projectId);
        throw new Error('Invalid project ID. Project ID must be a string.');
      }

      // Clean and validate the project ID
      const cleanProjectId = projectId.trim();
      if (!cleanProjectId || !cleanProjectId.startsWith('project-')) {
        console.error('Invalid project ID format:', cleanProjectId);
        throw new Error('Invalid project ID format. Project ID must start with "project-"');
      }

      console.log('Using project ID:', cleanProjectId);
      const projectRef = doc(db, 'projects', cleanProjectId);
      console.log('Project reference:', projectRef);
      
      const projectSnap = await getDoc(projectRef);
      console.log('Project snapshot exists:', projectSnap.exists());
      
      if (!projectSnap.exists()) {
        throw new Error(`Project with ID ${cleanProjectId} not found`);
      }
      
      const project = projectSnap.data() as Project;
      console.log('Current project data:', project);
      
      // Ensure sprints array exists and is an array
      const currentSprints = Array.isArray(project.sprints) ? project.sprints : [];
      console.log('Current sprints:', currentSprints);
      
      // Validate sprint object
      if (!sprint || typeof sprint !== 'object') {
        throw new Error('Invalid sprint object');
      }
      
      // Add the new sprint
      const updatedSprints = [...currentSprints, sprint];
      console.log('Updated sprints:', updatedSprints);
      
      await updateDoc(projectRef, { 
        sprints: updatedSprints 
      });
      console.log('Sprint added successfully');
    } catch (error) {
      console.error('Error in addSprint:', error);
      throw error;
    }
  },

  async updateSprint(projectId: string, sprint: Sprint): Promise<void> {
    try {
      checkInitialization();
      console.log('Updating sprint:', sprint);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const project = projectSnap.data() as Project;
      const updatedSprints = project.sprints.map(s => 
        s.id === sprint.id ? sprint : s
      );
      
      await updateDoc(projectRef, { sprints: updatedSprints });
      console.log('Sprint updated successfully');
    } catch (error) {
      console.error('Error in updateSprint:', error);
      throw error;
    }
  },

  async deleteSprint(projectId: string, sprintId: string): Promise<void> {
    try {
      checkInitialization();
      console.log('Deleting sprint:', sprintId);
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const project = projectSnap.data() as Project;
      const updatedSprints = project.sprints.filter(s => s.id !== sprintId);
      
      await updateDoc(projectRef, { sprints: updatedSprints });
      console.log('Sprint deleted successfully');
    } catch (error) {
      console.error('Error in deleteSprint:', error);
      throw error;
    }
  },

  // Move issue between sprint and backlog
  async moveIssue(
    projectId: string,
    issueId: string,
    fromSprintId: string | null,
    toSprintId: string | null
  ): Promise<void> {
    try {
      checkInitialization();
      console.log('Moving issue:', { issueId, fromSprintId, toSprintId });
      
      const projectRef = doc(db, PROJECTS_COLLECTION, projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (!projectSnap.exists()) {
        throw new Error('Project not found');
      }
      
      const project = projectSnap.data() as Project;
      let issue: Issue | undefined;
      
      // Remove issue from source
      if (fromSprintId) {
        const fromSprint = project.sprints.find(s => s.id === fromSprintId);
        if (fromSprint) {
          issue = fromSprint.issues.find(i => i.id === issueId);
          fromSprint.issues = fromSprint.issues.filter(i => i.id !== issueId);
        }
      } else {
        issue = project.backlog.find(i => i.id === issueId);
        project.backlog = project.backlog.filter(i => i.id !== issueId);
      }
      
      // Add issue to destination
      if (issue) {
        if (toSprintId) {
          const toSprint = project.sprints.find(s => s.id === toSprintId);
          if (toSprint) {
            toSprint.issues.push(issue);
          }
        } else {
          project.backlog.push(issue);
        }
      }
      
      await updateDoc(projectRef, {
        backlog: project.backlog,
        sprints: project.sprints
      });
      console.log('Issue moved successfully');
    } catch (error) {
      console.error('Error in moveIssue:', error);
      throw error;
    }
  },

  async getIssues(
    filters: IssueFilters = {},
    pageSize: number = 10,
    lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
  ): Promise<{ issues: Issue[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
      const issuesRef = collection(db as Firestore, 'issues');
      const queryConstraints: QueryConstraint[] = [];

      // ... existing code ...

      const issuesSnap = await getDocs(query(issuesRef, ...queryConstraints));
      const issues: Issue[] = [];
      const lastDocSnap = issuesSnap.docs[issuesSnap.docs.length - 1];

      issuesSnap.forEach(doc => {
        const issueData = doc.data() as Issue;
        issues.push(issueData);
      });

      return { issues, lastDoc: lastDocSnap };
    } catch (error) {
      console.error('Error in getIssues:', error);
      throw error;
    }
  }
}; 