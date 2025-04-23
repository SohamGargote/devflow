import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { format } from 'date-fns';
import SprintModal from '../components/SprintModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Sprint } from '../types';

const Dashboard = () => {
  const { project, addSprint, deleteSprint } = useProject();
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);

  const handleCreateSprint = (sprint: Sprint) => {
    addSprint(sprint);
  };

  const handleDeleteSprint = (sprint: Sprint) => {
    setSprintToDelete(sprint);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSprint = () => {
    if (sprintToDelete) {
      deleteSprint(sprintToDelete.id);
      setSprintToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => setIsSprintModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Sprint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.sprints.map((sprint) => {
          const totalPoints = sprint.issues.reduce((sum, issue) => sum + issue.points, 0);
          const completedPoints = sprint.issues
            .filter((issue) => issue.status === 'Done')
            .reduce((sum, issue) => sum + issue.points, 0);
          const progress = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

          const inProgressItems = sprint.issues.filter(
            (issue) => issue.status === 'In Progress'
          ).length;
          const completedItems = sprint.issues.filter(
            (issue) => issue.status === 'Done'
          ).length;

          return (
            <div key={sprint.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{sprint.name}</h2>
                  <p className="text-sm text-gray-500">
                    {format(new Date(sprint.startDate), 'MMM d')} -{' '}
                    {format(new Date(sprint.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/sprint/${sprint.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    View Board
                  </Link>
                  <button
                    onClick={() => handleDeleteSprint(sprint)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-medium text-gray-700">
                      {completedPoints}/{totalPoints} points
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{inProgressItems}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{completedItems}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Sprint Goal</p>
                  <p className="text-sm font-medium">{sprint.goal}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Backlog Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Backlog Items</p>
            <p className="text-2xl font-bold text-gray-900">{project.backlog.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">High Priority</p>
            <p className="text-2xl font-bold text-red-600">
              {project.backlog.filter((issue) => issue.priority === 'High').length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ready for Sprint</p>
            <p className="text-2xl font-bold text-blue-600">
              {project.backlog.filter((issue) => issue.status === 'To Do').length}
            </p>
          </div>
        </div>
      </div>

      <SprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onSubmit={handleCreateSprint}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSprintToDelete(null);
        }}
        onConfirm={confirmDeleteSprint}
        title="Delete Sprint"
        message={`Are you sure you want to delete the sprint "${sprintToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Dashboard; 