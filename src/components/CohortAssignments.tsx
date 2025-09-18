import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, Trash2, File, Users, Plus, Eye } from 'lucide-react';
import { useCohortAssignments, type AssignmentSubmission } from '@/hooks/useCohortAssignments';
import { formatDistanceToNow } from 'date-fns';

interface CohortAssignmentsProps {
  cohortId: string;
}

export const CohortAssignments = ({ cohortId }: CohortAssignmentsProps) => {
  const {
    assignments,
    allSubmissions,
    loading,
    uploading,
    isAdmin,
    uploadAssignment,
    deleteAssignment,
    getDownloadUrl
  } = useCohortAssignments(cohortId);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Pre-populate name with filename without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setAssignmentName(nameWithoutExt);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !assignmentName.trim()) return;

    const success = await uploadAssignment(
      selectedFile,
      assignmentName.trim(),
      assignmentDescription.trim() || undefined
    );

    if (success) {
      // Reset form
      setSelectedFile(null);
      setAssignmentName('');
      setAssignmentDescription('');
      setUploadDialogOpen(false);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const url = await getDownloadUrl(filePath);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignment(assignmentId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/4 mb-4" />
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            My Assignments
          </CardTitle>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Upload Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    accept="*/*"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="name">Assignment Name</Label>
                  <Input
                    id="name"
                    value={assignmentName}
                    onChange={(e) => setAssignmentName(e.target.value)}
                    placeholder="Enter assignment name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={assignmentDescription}
                    onChange={(e) => setAssignmentDescription(e.target.value)}
                    placeholder="Enter assignment description"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !assignmentName.trim() || uploading}
                    className="flex-1"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="w-12 h-12 mx-auto mb-3" />
              <p>No assignments uploaded yet</p>
              <p className="text-sm">Upload your first assignment to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{assignment.name}</h4>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {assignment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{assignment.file_name}</span>
                      <span>{formatFileSize(assignment.file_size)}</span>
                      <span>
                        Uploaded {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(assignment.file_path, assignment.file_name)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(assignment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin/Facilitator View */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <p>No submissions yet</p>
                <p className="text-sm">Students haven't uploaded any assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allSubmissions.map((submission) => (
                  <div
                    key={submission.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {submission.user_name || submission.user_email}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {submission.assignment_count} assignment{submission.assignment_count !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Files
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Assignments by {submission.user_name || submission.user_email}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {submission.assignments.map((assignment, index) => (
                            <div key={assignment.id}>
                              {index > 0 && <Separator />}
                              <div className="space-y-2">
                                <h5 className="font-medium">{assignment.name}</h5>
                                {assignment.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {assignment.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-muted-foreground">
                                    <p>{assignment.file_name}</p>
                                    <p>{formatFileSize(assignment.file_size)} • 
                                      Uploaded {formatDistanceToNow(new Date(assignment.created_at), { addSuffix: true })}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDownload(assignment.file_path, assignment.file_name)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDelete(assignment.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};