import { useState, useEffect } from 'react';
import { Sprint } from '../types';

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sprint: Sprint) => void;
  initialSprint?: Sprint;
}

const SprintModal: React.FC<SprintModalProps> = ({ isOpen, onClose, onSubmit, initialSprint }) => {
  const [sprint, setSprint] = useState<Partial<Sprint>>({
    name: '',
    startDate: '',
    endDate: '',
    goal: '',
    issues: [],
  });

  useEffect(() => {
    if (initialSprint) {
      setSprint(initialSprint);
    }
  }, [initialSprint]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sprint.name && sprint.startDate && sprint.endDate) {
      const newSprint: Sprint = {
        id: initialSprint?.id || `sprint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        goal: sprint.goal || '',
        issues: initialSprint?.issues || [],
      };
      onSubmit(newSprint);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialSprint ? 'Edit Sprint' : 'Create Sprint'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sprint Name</label>
            <input
              type="text"
              value={sprint.name}
              onChange={(e) => setSprint({ ...sprint, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={sprint.startDate}
              onChange={(e) => setSprint({ ...sprint, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={sprint.endDate}
              onChange={(e) => setSprint({ ...sprint, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sprint Goal</label>
            <textarea
              value={sprint.goal}
              onChange={(e) => setSprint({ ...sprint, goal: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
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
              {initialSprint ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SprintModal; 