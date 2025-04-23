export type IssueType = 'Story' | 'Bug' | 'Task';
export type Priority = 'High' | 'Medium' | 'Low';
export type Status = 'To Do' | 'In Progress' | 'Done';

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  points: number;
  status: Status;
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  goal: string;
  issues: Issue[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  sprints: Sprint[];
  backlog: Issue[];
} 