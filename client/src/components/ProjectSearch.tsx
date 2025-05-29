import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card } from './ui/card';

// Mock data for projects
const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'E-commerce Platform',
    description: 'A modern e-commerce solution built with React and Node.js',
    category: 'web',
    technologies: ['React', 'Node.js', 'MongoDB'],
  },
  {
    id: 2,
    title: 'AI Image Recognition',
    description: 'Machine learning project for image recognition',
    category: 'ai',
    technologies: ['Python', 'TensorFlow', 'OpenCV'],
  },
  // Add more mock projects as needed
];

const ProjectSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjects, setFilteredProjects] = useState(MOCK_PROJECTS);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = MOCK_PROJECTS.filter(project => 
      project.title.toLowerCase().includes(term) ||
      project.description.toLowerCase().includes(term) ||
      project.technologies.some(tech => tech.toLowerCase().includes(term))
    );
    
    setFilteredProjects(filtered);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <Input
          type="search"
          placeholder="Search projects by title, description, or technology..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full"
        />
      </div>

      <div className="grid gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="p-6">
            <h3 className="text-xl font-bold mb-2">{project.title}</h3>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map(tech => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
            <Button className="mt-4" variant="outline">
              View Details
            </Button>
          </Card>
        ))}
        
        {filteredProjects.length === 0 && (
          <div className="text-center text-gray-500">
            No projects found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSearch;
