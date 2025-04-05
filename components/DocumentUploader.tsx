
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, X, FileText, File, AlertTriangle, InfoIcon } from 'lucide-react';
import { 
  storeDocument, 
  StoredDocument, 
  getStoredDocuments, 
  deleteDocument, 
  isGoogleCloudStorageEnabled, 
  isGoogleCloudConfiguredCorrectly 
} from '@/utils/documentStorage';
import { SUBJECTS, GRADES } from '@/utils/api';
import { toast } from '@/components/ui/use-toast';

const DocumentUploader = () => {
  // Changed initial state to empty array as we'll load documents asynchronously
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<'curriculum' | 'textbook' | 'reference'>('curriculum');
  const [documentSubject, setDocumentSubject] = useState('');
  const [documentGrade, setDocumentGrade] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileType, setFileType] = useState<'txt' | 'pdf'>('txt');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGCS, setIsGCS] = useState<boolean>(false);
  const [isGCSValid, setIsGCSValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  useEffect(() => {
    const gcsEnabled = isGoogleCloudStorageEnabled();
    const gcsValid = isGoogleCloudConfiguredCorrectly();
    
    setIsGCS(gcsEnabled);
    setIsGCSValid(gcsValid);
    
    if (gcsEnabled && !gcsValid) {
      setError("Google Cloud Storage is enabled but not properly configured. Please check your credentials.");
    } else {
      setError(null);
    }

    // Load documents asynchronously
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const docs = await getStoredDocuments();
        setDocuments(docs);
      } catch (err) {
        console.error("Error loading documents:", err);
        toast({
          variant: "destructive",
          title: "Failed to load documents",
          description: err instanceof Error ? err.message : "Unknown error occurred"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit');
      return;
    }

    setDocumentName(file.name);
    
    if (file.type === 'application/pdf') {
      setFileType('pdf');
      await handlePdfFile(file);
    } else {
      setFileType('txt');
      await handleTextFile(file);
    }
  };

  const handleTextFile = async (file: File) => {
    try {
      const text = await readFileAsText(file);
      setFileContent(text);
    } catch (err) {
      setError('Failed to read text file. Please try again.');
      console.error('Error reading text file:', err);
    }
  };

  const handlePdfFile = async (file: File) => {
    try {
      const base64Content = await readFileAsBase64(file);
      setFileContent(base64Content);
    } catch (err) {
      setError('Failed to read PDF file. Please try again.');
      console.error('Error reading PDF file:', err);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!documentName || !fileContent) {
      setError('Please select a file and provide all required information');
      return;
    }

    if (isGCS && !isGCSValid) {
      setError("Google Cloud Storage is enabled but not properly configured. Please check your credentials.");
      toast({
        variant: "destructive",
        title: "Storage Configuration Error",
        description: "Your Google Cloud credentials may be missing required permissions. Make sure your service account has 'Storage Object Admin' role."
      });
      return;
    }

    setIsUploading(true);
    
    storeDocument({
      name: documentName,
      content: fileContent,
      type: documentType,
      fileType: fileType,
      subject: documentSubject,
      grade: documentGrade
    })
    .then(newDoc => {
      // Use an async function to update documents after upload
      const refreshDocuments = async () => {
        try {
          const updatedDocs = await getStoredDocuments();
          setDocuments(updatedDocs);
        } catch (err) {
          console.error("Error refreshing documents:", err);
        }
      };
      
      refreshDocuments();
      
      setDocumentName('');
      setFileContent('');
      setDocumentType('curriculum');
      setDocumentSubject('');
      setDocumentGrade('');
      setFileType('txt');
      
      const fileInput = document.getElementById('document-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been added to the knowledge base"
      });
    })
    .catch(err => {
      setError(err instanceof Error ? err.message : 'Failed to store document');
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err instanceof Error ? err.message : "Failed to store document"
      });
    })
    .finally(() => {
      setIsUploading(false);
    });
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      // Update documents list after deletion
      const updatedDocs = await getStoredDocuments();
      setDocuments(updatedDocs);
      
      toast({
        title: "Document Deleted",
        description: "The document has been removed from the knowledge base"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document"
      });
    }
  };

  const getFileIcon = (doc: StoredDocument) => {
    if (doc.fileType === 'pdf') {
      return <File className="h-5 w-5 text-destructive/80" />;
    }
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Upload Reference Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload curriculum documents, textbooks, or reference materials to enhance the generated lesson plans.
        </p>
        
        {isGCS && (
          <Alert className={`mb-4 ${isGCSValid ? 'bg-green-50 dark:bg-green-950/20 border-green-500' : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'}`}>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>{isGCSValid ? 'Google Cloud Storage Enabled' : 'Google Cloud Storage Configuration'}</AlertTitle>
            <AlertDescription>
              {isGCSValid 
                ? 'Your documents will be stored in Google Cloud Storage.' 
                : 'Google Cloud Storage is enabled but may not be properly configured. Make sure your credentials have "Storage Object Admin" permissions for the bucket.'}
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="document-file">Choose Document</Label>
            <Input 
              id="document-file" 
              type="file" 
              accept=".txt,.pdf" 
              onChange={handleFileChange}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Text files (.txt) and PDF files (.pdf) are supported</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select 
                value={documentType} 
                onValueChange={(value) => setDocumentType(value as 'curriculum' | 'textbook' | 'reference')}
              >
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curriculum">Curriculum Guide</SelectItem>
                  <SelectItem value="textbook">Textbook</SelectItem>
                  <SelectItem value="reference">Reference Material</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-subject">Subject (Optional)</Label>
              <Select 
                value={documentSubject} 
                onValueChange={setDocumentSubject}
              >
                <SelectTrigger id="document-subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subj) => (
                    <SelectItem key={subj} value={subj}>
                      {subj}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="document-grade">Grade Level (Optional)</Label>
              <Select 
                value={documentGrade} 
                onValueChange={setDocumentGrade}
              >
                <SelectTrigger id="document-grade">
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isUploading || !fileContent}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </Button>
        </form>
      </Card>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading documents...</span>
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Your Reference Documents</h3>
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
              <div className="flex items-center gap-3">
                {getFileIcon(doc)}
                <div>
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.type} {doc.fileType === 'pdf' && '• PDF'} {doc.subject && `• ${doc.subject}`} {doc.grade && `• ${doc.grade}`}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleDeleteDocument(doc.id)}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 border border-dashed rounded-md">
          <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No documents uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
