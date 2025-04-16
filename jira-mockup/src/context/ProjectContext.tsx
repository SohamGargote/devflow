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
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const initialProject: Project = {
  id: '1',
  name: 'Sample Project',
  description: 'A sample project for demonstration',
  sprints: [],
  backlog: [],
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const loadProject = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const loadedProject = await firebaseService.getProject('1');
        if (loadedProject) {
          setProject(loadedProject);
        } else {
          // Create initial project if it doesn't exist
          await firebaseService.createProject(initialProject);
        }
      } catch (err) {
        setError('Failed to load project');
        console.error('Error loading project:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [user]);

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
          newProject.backlog = newProject.backlog.filte