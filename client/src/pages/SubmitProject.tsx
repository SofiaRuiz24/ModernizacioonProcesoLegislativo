import React, { useState, useEffect } from 'react';
import { useEditor as useTipTapEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Upload, FileText, Save, CheckCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { ethers } from "ethers";
import contractJson from "../../../server/src/VotacionLegislatura.json"; // (archivo con el ABI y la dirección del contrato en Sepolia)


const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS; // Dirección del contrato desplegado en Sepolia

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

interface Legislador {
  address: string;
  name: string;
}

interface ProyectoLey {
  id: number;
  titulo: string;
  descripcion: string;
  proponente: string;
  activa: boolean;
}

export function SubmitProject() {
  const [isUsingEditor, setIsUsingEditor] = useState(true);
  const [signatures, setSignatures] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [legisladores, setLegisladores] = useState<Legislador[]>([]);
  const [selectedLegislador, setSelectedLegislador] = useState<string>('');
  const [proyectosLey, setProyectosLey] = useState<ProyectoLey[]>([]);
  const [sesionActiva, setSesionActiva] = useState<number | null>(null);

  const actualizarSesionActiva = async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractJson.abi, provider);
      const cantidadSesiones = await contract.obtenerCantidadSesiones();
      
      // Buscar la última sesión activa
      for (let i = Number(cantidadSesiones) - 1; i >= 0; i--) {
        const sesion = await contract.sesiones(BigInt(i));
        if (sesion.activa) {
          setSesionActiva(i);
          break;
        }
      }
    } catch (error) {
      console.error('Error fetching active session:', error);
    }
  };

  // Estado para los datos del proyecto
  const [proyecto, setProyecto] = useState({
    titulo: '',
    descripcion: ''
  });

  // Estado para los datos del usuario
  const [user, setUser] = useState({
    fullName: '',
    docType: '',
    docNumber: '',
    affiliation: ''
  });
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) return setLoadingUser(false);
      try {
        const res = await fetch('http://localhost:5001/api/validate-token', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser({
            fullName: data.user.username || '',
            docType: data.user.docType || '',
            docNumber: data.user.docNumber || '',
            affiliation: data.user.affiliation || ''
          });
        }
      } catch (e) { /* ignore error */ }
      setLoadingUser(false);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchLegisladores = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/legislators');
        if (response.ok) {
          const data = await response.json();
          setLegisladores(data);
        }
      } catch (error) {
        console.error('Error fetching legisladores:', error);
      }
    };

    const fetchProyectosLey = async () => {
      if (!window.ethereum || sesionActiva === null) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractJson.abi, provider);
        const cantidadLeyes = await contract.obtenerCantidadLeyes(sesionActiva);
        
        const proyectos: ProyectoLey[] = [];
        for (let i = 0; i < cantidadLeyes; i++) {
          const ley = await contract.obtenerLey(sesionActiva, i);
          proyectos.push({
            id: Number(ley.id),
            titulo: ley.titulo,
            descripcion: ley.descripcion,
            proponente: 'Legislador', // Aquí podrías agregar el nombre del proponente si lo tienes
            activa: ley.activa
          });
        }
        setProyectosLey(proyectos);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchLegisladores();
    if (sesionActiva !== null) {
      fetchProyectosLey();
    }
  }, [sesionActiva]);

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
    if (!window.ethereum) {
      setError('Por favor, instala MetaMask para continuar');
      return;
    }
    if (sesionActiva === null) {
      setError('No hay una sesión activa');
      return;
    }
    if (!selectedLegislador) {
      setError('Por favor, selecciona un legislador');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);

      // Convertir sesionActiva a BigInt si no lo es ya
      const sesionActivaBigInt = BigInt(sesionActiva);

      const tx = await contract.agregarLey(
        sesionActivaBigInt,
        proyecto.titulo,
        isUsingEditor ? editor?.getHTML() || '' : 'Proyecto en PDF'
      );

      await tx.wait();
      setSuccess('Proyecto de ley presentado exitosamente');
      
      // Actualizar la lista de proyectos
      const cantidadLeyes = await contract.obtenerCantidadLeyes(sesionActivaBigInt);
      const nuevaLey = await contract.obtenerLey(sesionActivaBigInt, cantidadLeyes - 1n);
      setProyectosLey(prev => [...prev, {
        id: Number(nuevaLey.id),
        titulo: nuevaLey.titulo,
        descripcion: nuevaLey.descripcion,
        proponente: selectedLegislador,
        activa: nuevaLey.activa
      }]);

      // Limpiar el formulario
      setProyecto({ titulo: '', descripcion: '' });
      editor?.commands.setContent('');
      setSignatures(null);
      setProjectFile(null);
    } catch (error) {
      console.error('Error submitting project:', error);
      setError(error instanceof Error ? error.message : 'Error al presentar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <CreateSessionCard onSessionCreated={actualizarSesionActiva} />
        
        {sesionActiva === null ? (
          <Card className="mt-8 p-6">
            <p className="text-center text-gray-600">No hay una sesión activa. Por favor, crea una nueva sesión.</p>
          </Card>
        ) : (
          <>
            <Card className="shadow-sm border-0 mt-8">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-semibold tracking-tight">Presentación de Proyecto</h1>
                <p className="text-muted-foreground mt-1">Complete el formulario para presentar su proyecto en la sesión activa</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Legislador Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-medium">Selección de Legislador</h2>
                    <div className="h-px flex-1 bg-gray-100"></div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="legislador" className="text-sm font-medium">Legislador</Label>
                    <Select
                      value={selectedLegislador}
                      onChange={(e) => setSelectedLegislador(e.target.value)}
                      options={legisladores.map(leg => ({
                        key: leg.address,
                        value: leg.address,
                        label: leg.name
                      }))}
                      className="w-full"
                    />
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
                        value={proyecto.titulo}
                        onChange={(e) => setProyecto(prev => ({ ...prev, titulo: e.target.value }))}
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

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full py-2 h-11 bg-gray-800 hover:bg-gray-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Presentando Proyecto...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Presentar Proyecto
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Lista de Proyectos Presentados */}
            <Card className="shadow-sm border-0 mt-8">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold tracking-tight">Proyectos Presentados</h2>
                <p className="text-muted-foreground mt-1">Lista de proyectos presentados en la sesión actual</p>
              </div>

              <div className="p-6">
                {proyectosLey.length === 0 ? (
                  <p className="text-center text-gray-600">No hay proyectos presentados en esta sesión</p>
                ) : (
                  <div className="space-y-4">
                    {proyectosLey.map((proyecto) => (
                      <div key={proyecto.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{proyecto.titulo}</h3>
                        <div 
                          className="text-sm text-gray-600 mt-1 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: proyecto.descripcion }}
                        />
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Proponente: {proyecto.proponente}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            proyecto.activa ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {proyecto.activa ? 'Activo' : 'Finalizado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

interface CreateSessionCardProps {
  onSessionCreated: () => Promise<void>;
}

function CreateSessionCard({ onSessionCreated }: CreateSessionCardProps) {
  const [fecha, setFecha] = useState("");
  const [descrip, setDescrip] = useState("");
  const [tx, setTx] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!window.ethereum) { 
      setErr("Metamask no detectado"); 
      return; 
    }
    setLoading(true);
    setErr(null);
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractJson.abi, signer);
      const tx = await contract.crearSesion(fecha, descrip);
      await tx.wait(); // Esperar a que la transacción se confirme
      setTx(tx.hash);
      setErr(null);
      // Limpiar el formulario
      setFecha("");
      setDescrip("");
      // Actualizar el estado de la sesión activa
      await onSessionCreated();
    } catch (error: unknown) { 
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setErr(errorMessage); 
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="shadow-sm border-0 mt-8">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-semibold tracking-tight">Crear Sesión (Votación Legislatura)</h1>
        <p className="text-muted-foreground mt-1">Ingrese la fecha y descripción para crear una nueva sesión (según el smartcontract).</p>
      </div>
      <form onSubmit={createSession} className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fecha" className="text-sm font-medium">Fecha (por ejemplo, "2023-12-31")</Label>
          <Input
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="h-10 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="descrip" className="text-sm font-medium">Descripción (por ejemplo, "Sesión de fin de año")</Label>
          <Input
            id="descrip"
            value={descrip}
            onChange={(e) => setDescrip(e.target.value)}
            required
            className="h-10 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
        {err && (<p className="text-sm text-red-500">{err}</p>)}
        {tx && (<p className="text-sm text-green-500">Transacción enviada (hash: {tx})</p>)}
        <Button 
          type="submit" 
          className="w-full py-2 h-11 bg-gray-800 hover:bg-gray-700 text-white font-medium"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creando Sesión...
            </>
          ) : (
            'Crear Sesión'
          )}
        </Button>
      </form>
    </Card>
  );
}