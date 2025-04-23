import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Issue, Sprint } from '../types';
import { firebaseService } from '../services/firebaseService';
import { useUser } from '@clerk/clerk-react';

interface ProjectContextType {
  project: Project;
  addIssue: (issue: Issue) => Promise<void>;
  updateIssue: (issue: Issue) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  addSprint: (sprint: Sprint) => Promise<void>;
  updateSprint: (sprint: Sprint) => Promise<void>;
  deleteSprint: (sprintId: string) => Promise<void>;
  moveIssue: (issueId: string, fromSprintId: string | null, toSprintId: string | null) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  retryLoad: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const initialProject: Project = {
  id: 'project-1',
  name: 'Sample Project',
  description: 'A sample project for demonstration',
  sprints: [],
  backlog: [],
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded: isUserLoaded } = useUser();

  const loadProject = async () => {
    if (!isUserLoaded) {
      console.log('Waiting for user authentication to load...');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        console.log('No user logged in, skipping project load');
        setIsLoading(false);
        return;
      }

      console.log('Loading project for user:', user.id);
      const loadedProject = await firebaseService.getProject('project-1');
      
      if (loadedProject) {
        console.log('Project loaded successfully:', loadedProject);
        setProject(loadedProject);
      } else {
        console.log('No project found, creating initial project');
        await firebaseService.createProject(initialProject);
        setProject(initialProject);
      }
    } catch (err: any) {
      console.error('Error loading project:', err);
      if (err.message.includes('permission') || err.message.includes('authenticated')) {
        setError(err.message);
      } else {
        setError('Failed to load project. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [user, isUserLoaded]);

  const retryLoad = () => {
    setError(null);
    loadProject();
  };

  const addIssue = async (issue: Issue) => {
    try {
      await firebaseService.addIssue(project.id, issue);
      setProject(prev => ({
        ...prev,
        backlog: [...prev.backlog, issue],
      }));
    } catch (err) {
      setError('Failed to add issue');
      console.error('Error adding issue:', err);
    }
  };

  const updateIssue = async (issue: Issue) => {
    try {
      await firebaseService.updateIssue(project.id, issue);
      setProject(prev => ({
        ...prev,
        backlog: prev.backlog.map(i => (i.id === issue.id ? issue : i)),
        sprints: prev.sprints.map(sprint => ({
          ...sprint,
          issues: sprint.issues.map(i => (i.id === issue.id ? issue : i)),
        })),
      }));
    } catch (err) {
      setError('Failed to update issue');
      console.error('Error updating issue:', err);
    }
  };

  const deleteIssue = async (issueId: string) => {
    try {
      await firebaseService.deleteIssue(project.id, issueId);
      setProject(prev => ({
        ...prev,
        backlog: prev.backlog.filter(i => i.id !== issueId),
        sprints: prev.sprints.map(sprint => ({
          ...sprint,
          issues: sprint.issues.filter(i => i.id !== issueId),
        })),
      }));
    } catch (err) {
      setError('Failed to delete issue');
      console.error('Error deleting issue:', err);
    }
  };

  const addSprint = async (sprint: Sprint) => {
    try {
      await firebaseService.addSprint(project.id, sprint);
      setProject(prev => ({
        ...prev,
        sprints: [...prev.sprints, sprint],
      }));
    } catch (err) {
      setError('Failed to add sprint');
      console.error('Error adding sprint:', err);
    }
  };

  const updateSprint = async (sprint: Sprint) => {
    try {
      await firebaseService.updateSprint(project.id, sprint);
      setProject(prev => ({
        ...prev,
        sprints: prev.sprints.map(s => (s.id === sprint.id ? sprint : s)),
      }));
    } catch (err) {
      setError('Failed to update sprint');
      console.error('Error updating sprint:', err);
    }
  };

  const deleteSprint = async (sprintId: string) => {
    try {
      await firebaseService.deleteSprint(project.id, sprintId);
      setProject(prev => ({
        ...prev,
        sprints: prev.sprints.filter(s => s.id !== sprintId),
      }));
    } catch (err) {
      setError('Failed to delete sprint');
      console.error('Error deleting sprint:', err);
    }
  };

  const moveIssue = async (issueId: string, fromSprintId: string | null, toSprintId: string | null) => {
    try {
      await firebaseService.moveIssue(project.id, issueId, fromSprintId, toSprintId);
      setProject(prev => {
        let issue: Issue | undefined;
        const newProject = { ...prev };

        // Remove issue from source
        if (fromSprintId) {
          const fromSprint = newProject.sprints.find(s => s.id === fromSprintId);
          if (fromSprint) {
            issue = fromSprint.issues.find(i => i.id === issueId);
            fromSprint.issues = fromSprint.issues.filter(i => i.id !== issueId);
          }
        } else {
          issue = newProject.backlog.find(i => i.id === issueId);
          newProject.backlog = newProject.backlog.filter(i => i.id !== issueId);
        }

        // Add issue to destination
        if (issue) {
          if (toSprintId) {
            const toSprint = newProject.sprints.find(s => s.id === toSprintId);
            if (toSprint) {
              toSprint.issues.push(issue);
            }
          } else {
            newProject.backlog.push(issue);
          }
        }

        return newProject;
      });
    } catch (err) {
      setError('Failed to move issue');
      console.error('Error moving issue:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <div className="mb-4 text-sm text-gray-600">
            Please check:
            <ul className="list-disc list-inside mt-2">
              <li>You are logged in with Clerk</li>
              <li>Your Firebase project has the correct security rules</li>
              <li>Your Firebase configuration is correct</li>
              <li>Your Firebase project has billing enabled</li>
            </ul>
          </div>
          <button 
            onClick={retryLoad}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProjectContext.Provider
      value={{
        project,
        addIssue,
        updateIssue,
        deleteIssue,
        addSprint,
        updateSprint,
        deleteSprint,
        moveIssue,
        isLoading,
        error,
        retryLoad,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}; 