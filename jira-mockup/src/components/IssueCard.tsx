import { Issue } from '../types';

interface IssueCardProps {
  issue: Issue;
  onEdit?: (issue: Issue) => void;
  onDelete?: (issueId: string) => void;
  onMove?: (issueId: string, newStatus: string) => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onEdit, onDelete, onMove }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Story':
        return 'bg-blue-100 text-blue-800';
      case 'Bug':
        return 'bg-red-100 text-red-800';
      case 'Task':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-2 mb-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(issue.type)}`}>
          {issue.type}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
          {issue.priority}
        </span>
      </div>
      <h3 className="font-medium mb-2">{issue.title}</h3>
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{issue.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{issue.points} points</span>
        <div className="flex space-x-2">
          {onMove && (
            <select
              value={issue.status}
              onChange={(e) => onMove(issue.id, e.target.value)}
              className="border rounded px-2 py-1 text-xs"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(issue)}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(issue.id)}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCard; 