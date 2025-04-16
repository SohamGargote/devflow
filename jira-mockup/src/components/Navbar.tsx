import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
  const { project } = useProject();
  const { isSignedIn } = useUser();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              DevFlow 
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isSignedIn && (
              <>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/backlog"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Backlog
                </Link>
                <div className="relative group">
                  <button className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                    Sprints
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    {project.sprints.map((sprint) => (
                      <Link
                        key={sprint.id}
                        to={`/sprint/${sprint.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {sprint.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div className="ml-4">
              <UserButton afterSignOutUrl="/login" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 