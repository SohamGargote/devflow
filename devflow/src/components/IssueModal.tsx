import { useState, useEffect } from 'react';
import { Issue, IssueType, Priority, Status } from '../types';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (issue: Issue) => void;
  initialIssue?: Issue;
}

const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose, onSubmit, initialIssue }) => {
  const [issue, setIssue] = useState<Partial<Issue>>({
    title: '',
    description: '',
    type: 'Story',
    priority: 'Medium',
    points: 1,
    status: 'To Do',
  });

  useEffect(() => {
    if (initialIssue) {
      setIssue(initialIssue);
    }
  }, [initialIssue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (issue.title && issue.description) {
      const newIssue: Issue = {
        id: initialIssue?.id || Date.now().toString(),
        title: issue.title,
        description: issue.description,
        type: issue.type as IssueType,
        priority: issue.priority as Priority,
        points: issue.points || 1,
        status: issue.status as Status,
        createdAt: initialIssue?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSubmit(newIssue);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialIssue ? 'Edit Issue' : 'Create Issue'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={issue.title}
              onChange={(e) => setIssue({ ...issue, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={issue.description}
              onChange={(e) => setIssue({ ...issue, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={issue.type}
                onChange={(e) => setIssue({ ...issue, type: e.target.value as IssueType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Story">Story</option>
                <option value="Bug">Bug</option>
                <option value="Task">Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={issue.priority}
                onChange={(e) => setIssue({ ...issue, priority: e.target.value as Priority })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Points</label>
              <input
                type="number"
                min="1"
                value={issue.points}
                onChange={(e) => setIssue({ ...issue, points: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={issue.status}
                onChange={(e) => setIssue({ ...issue, status: e.target.value as Status })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {initialIssue ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueModal; 