import { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import { Issue, IssueType, Priority, Status } from '../types';

const Backlog = () => {
  const { project, addIssue, updateIssue, deleteIssue } = useProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | undefined>();
  const [filters, setFilters] = useState({
    type: 'All Types',
    priority: 'All Priorities',
    status: 'All Statuses',
  });

  const handleCreateIssue = () => {
    setEditingIssue(undefined);
    setIsModalOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setIsModalOpen(true);
  };

  const handleSubmitIssue = (issue: Issue) => {
    if (editingIssue) {
      updateIssue(issue);
    } else {
      addIssue(issue);
    }
  };

  const filteredIssues = project.backlog.filter((issue) => {
    if (filters.type !== 'All Types' && issue.type !== filters.type) return false;
    if (filters.priority !== 'All Priorities' && issue.priority !== filters.priority) return false;
    if (filters.status !== 'All Statuses' && issue.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Backlog</h1>
        <button
          onClick={handleCreateIssue}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Issue
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex space-x-4">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border rounded-md px-3 py-2"
            >
              <option>All Types</option>
              <option>Story</option>
              <option>Bug</option>
              <option>Task</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="border rounded-md px-3 py-2"
            >
              <option>All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border rounded-md px-3 py-2"
            >
              <option>All Statuses</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="p-4 hover:bg-gray-50">
              <IssueCard
                issue={issue}
                onEdit={handleEditIssue}
                onDelete={deleteIssue}
              />
            </div>
          ))}
        </div>
      </div>

      <IssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitIssue}
        initialIssue={editingIssue}
      />
    </div>
  );
};

export default Backlog; 