
import React from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { InfoIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CloudStorageHelpProps {
  isOpen?: boolean;
}

const CloudStorageHelp: React.FC<CloudStorageHelpProps> = ({ isOpen = false }) => {
  const [open, setOpen] = React.useState(isOpen);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="mt-4 w-full border rounded-md p-2"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center">
          <InfoIcon className="h-4 w-4 mr-2 text-blue-500" />
          Google Cloud Storage Help & Troubleshooting
        </h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-0 h-7 w-7">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="mt-2 space-y-4">
        <Alert>
          <AlertDescription>
            <p className="font-semibold mb-2">Common Issues & Solutions:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <span className="font-medium">Bad Request / keyInvalid error</span>: Your service account may not have
                the correct permissions. Ensure it has the "Storage Object Admin" role for the bucket.
              </li>
              <li>
                <span className="font-medium">Permission Denied</span>: Verify that your service account has proper IAM
                permissions and that the bucket exists and is accessible.
              </li>
              <li>
                <span className="font-medium">403 Forbidden</span>: Your service account needs proper permissions for
                the specified bucket. Check IAM settings in Google Cloud Console.
              </li>
              <li>
                <span className="font-medium">404 Not Found</span>: The specified bucket may not exist or may be in a
                different region. Check your bucket configuration.
              </li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <div className="text-sm space-y-3">
          <p className="font-semibold">Setting up Google Cloud Storage correctly:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create a project in Google Cloud Console</li>
            <li>Enable the Cloud Storage API</li>
            <li>Create a storage bucket</li>
            <li>Create a service account with Storage Object Admin role</li>
            <li>Generate a JSON key for the service account</li>
            <li>Upload the JSON key file here</li>
          </ol>
          
          <div className="mt-3 border-t pt-3">
            <p className="font-medium text-red-500">Important Security Note:</p>
            <p className="mt-1">
              Your service account credentials are sensitive. They are only stored in your browser's local memory 
              and never sent to our servers. For production use, use proper secure credential management.
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CloudStorageHelp;
