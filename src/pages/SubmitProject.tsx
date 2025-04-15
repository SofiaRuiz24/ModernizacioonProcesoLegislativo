import React, { useState } from 'react';
import { useEditor as useTipTapEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Upload, FileText, Save, CheckCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

export function SubmitProject() {
  const [isUsingEditor, setIsUsingEditor] = useState(true);
  const [signatures, setSignatures] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);

  const editor = useTipTapEditor({
    extensions: [StarterKit],
    content: ''
  });

  const {
    getRootProps: getSignatureProps,
    getInputProps: getSignatureInput
  } = useDropzone({
    onDrop: files => setSignatures(files[0]),
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1
  });

  const {
    getRootProps: getProjectProps,
    getInputProps: getProjectInput
  } = useDropzone({
    onDrop: files => setProjectFile(files[0]),
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isUsingEditor
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-sm border-0">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-semibold tracking-tight">Presentación de Proyecto</h1>
            <p className="text-muted-foreground mt-1">Complete el formulario para presentar su proyecto</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-medium">Información Personal</h2>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">Nombre Completo</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Ingrese su nombre completo" 
                    required 
                    className="h-10 border-gray-200 focus:border-gray-300 focus:ring-gray-200" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docType" className="text-sm font-medium">Tipo de Documento</Label>
                  <Select
                    className="h-10 border-gray-200"
                    options={[
                      { value: "dni", label: "DNI" },
                      { value: "passport", label: "Pasaporte" },
                      { value: "other", label: "Otro" }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="docNumber" className="text-sm font-medium">Número de Documento</Label>
                  <Input 
                    id="docNumber" 
                    placeholder="Ingrese su número de documento" 
                    required 
                    className="h-10 border-gray-200 focus:border-gray-300 focus:ring-gray-200" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="affiliation" className="text-sm font-medium">Afiliación (Opcional)</Label>
                  <Input 
                    id="affiliation" 
                    placeholder="Ingrese su afiliación" 
                    className="h-10 border-gray-200 focus:border-gray-300 focus:ring-gray-200" 
                  />
                </div>
              </div>
            </div>

            {/* Project Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-medium">Información del Proyecto</h2>
                <div className="h-px flex-1 bg-gray-100"></div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-medium">Nombre del Proyecto</Label>
                  <Input 
                    id="projectName" 
                    placeholder="Ingrese el nombre del proyecto" 
                    required 
                    className="h-10 border-gray-200 focus:border-gray-300 focus:ring-gray-200" 
                  />
                </div>

                {/* Signatures Upload */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Documento de Firmas</Label>
                  <div 
                    {...getSignatureProps()} 
                    className="border border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input {...getSignatureInput()} />
                    {signatures ? (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium">{signatures.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          Arrastra o haz clic para subir el documento de firmas (PDF)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Tamaño máximo: 10MB</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Project Content Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Contenido del Proyecto</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsUsingEditor(!isUsingEditor)} 
                      className="text-xs h-8 px-3 py-1"
                    >
                      {isUsingEditor ? 'Subir PDF' : 'Usar Editor'}
                    </Button>
                  </div>

                  {isUsingEditor ? (
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 p-2 border-b flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-xs" 
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                        >
                          Negrita
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-xs" 
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                        >
                          Cursiva
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-xs" 
                          onClick={() => editor?.chain().focus().setParagraph().run()}
                        >
                          Párrafo
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-3 text-xs" 
                          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                        >
                          Título
                        </Button>
                      </div>
                      <EditorContent 
                        editor={editor} 
                        className="p-4 min-h-[300px] prose max-w-none focus:outline-none" 
                      />
                    </div>
                  ) : (
                    <div 
                      {...getProjectProps()} 
                      className="border border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input {...getProjectInput()} />
                      {projectFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-sm font-medium">{projectFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            Arrastra o haz clic para subir el proyecto (PDF)
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Tamaño máximo: 10MB</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full py-2 h-11 bg-gray-800 hover:bg-gray-700 text-white font-medium"
              >
                <Save className="mr-2 h-4 w-4" />
                Presentar Proyecto
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Al presentar, acepta los términos y condiciones del sistema
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}