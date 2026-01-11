import React, { useState } from 'react';
import { UploadZone } from './upload/UploadZone';
import { TemplatesList } from './templates/TemplatesList';
import { useTemplates } from '../hooks/useTemplates';
import { Sparkles, Zap, FileCheck } from 'lucide-react';
import { Template } from '../types';

export const LandingPage: React.FC = () => {
  const { templates, deleteTemplate } = useTemplates();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (_file: File) => {
    setIsUploading(true);
    try {
      // TODO: Process the file with mammoth.js
      // For now, just simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditTemplate = (_template: Template) => {
    // TODO: Navigate to template editor
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-purple/5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">Automate</span> your document workflow
            </h1>
            <p className="text-xl text-neutral-gray max-w-3xl mx-auto mb-8">
              Transform your template documents into powerful automation tools.
              Upload, define fields, and generate hundreds of personalized documents in minutes.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-gray/10">
                <Zap size={18} className="text-accent-green" />
                <span className="text-sm font-medium">Lightning Fast</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-gray/10">
                <Sparkles size={18} className="text-primary" />
                <span className="text-sm font-medium">Smart Templates</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-neutral-gray/10">
                <FileCheck size={18} className="text-accent-purple" />
                <span className="text-sm font-medium">Batch Generation</span>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <UploadZone onFileUpload={handleFileUpload} />
            {isUploading && (
              <div className="mt-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                <p className="mt-2 text-neutral-gray">Processing your document...</p>
              </div>
            )}
          </div>

          {/* Templates Section */}
          {templates.length > 0 && (
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-neutral-dark mb-2">
                    Your Templates
                  </h2>
                  <p className="text-neutral-gray">
                    {templates.length} template{templates.length !== 1 ? 's' : ''} ready to use
                  </p>
                </div>
              </div>

              <TemplatesList
                templates={templates}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
              />
            </div>
          )}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            How <span className="gradient-text">Templify</span> Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Template</h3>
              <p className="text-neutral-gray">
                Upload your Word document template with placeholder text
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Define Fields</h3>
              <p className="text-neutral-gray">
                Highlight text and create fillable fields with custom names
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Documents</h3>
              <p className="text-neutral-gray">
                Fill in data and generate personalized documents instantly
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
