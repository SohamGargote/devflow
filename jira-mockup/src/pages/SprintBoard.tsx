import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import IssueCard from '../components/IssueCard';
import IssueModal from '../components/IssueModal';
import { Issue, Status } from '../types';

const SprintBoard = () => {
  const { id } = useParams();
  const { project, updateIssue, moveIssue, updateSprint } = useProject();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | undefined>();

  const currentSprint = project.sprints.find((sprint) => sprint.id === id);
  const columns = [
    { id: 'todo', title: 'To Do', status: 'To Do' as Status },
    { id: 'in-progress', title: 'In Progress', status: 'In Progress' as Status },
    { id: 'done', title: 'Done', status: 'Done' as Status },
  ];

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
    } else if (currentSprint) {
      // Add new issue to the current sprint
      const updatedSprint = {
        ...currentSprint,
        issues: [...currentSprint.issues, issue],
      };
      updateSprint(updatedSprint);
    }
    setIsModalOpen(false);
  };

  const handleMoveIssue = (issueId: string, newStatus: string) => {
    if (currentSprint) {
      const issue = currentSprint.issues.find((i) => i.id === issueId);
      if (issue) {
        const updatedIssue = { ...issue, status: newStatus as Status };
        updateIssue(updatedIssue);
      }
    }
  };

  if (!currentSprint) {
    return <div className="text-center py-8">Sprint not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentSprint.name}</h1>
          <p className="text-gray-600">
            {new Date(currentSprint.startDate).toLocaleDateString()} -{' '}
            {new Date(currentSprint.endDate).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleCreateIssue}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Issue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">{column.title}</h2>
            <div className="space-y-4">
              {currentSprint.issues
                .filter((issue) => issue.status === column.status)
                .map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onEdit={handleEditIssue}
                    onMove={handleMoveIssue}
                  />
                ))}
            </div>
          </div>
        ))}
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

export default SprintBoard; 