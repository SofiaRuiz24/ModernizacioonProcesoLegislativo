import { useState } from 'react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';

const ProjectSubmissionPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    teamMembers: '',
    technologies: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Project submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 bg-white shadow-lg rounded-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Submit Your Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project title"
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your project..."
                className="min-h-[150px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  options={[
                    { value: "", label: "Select a category" },
                    { value: "web", label: "Web Development" },
                    { value: "mobile", label: "Mobile App" },
                    { value: "desktop", label: "Desktop Application" },
                    { value: "ai", label: "AI/Machine Learning" },
                    { value: "other", label: "Other" }
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamMembers">Team Members</Label>
                <Input
                  id="teamMembers"
                  name="teamMembers"
                  value={formData.teamMembers}
                  onChange={handleChange}
                  placeholder="Enter team members"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="technologies">Technologies Used</Label>
              <Input
                id="technologies"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, MongoDB"
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">
                Submit Project
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProjectSubmissionPage;
