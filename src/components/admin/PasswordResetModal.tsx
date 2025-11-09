import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    full_name?: string;
  } | null;
}

export function PasswordResetModal({ isOpen, onClose, user }: PasswordResetModalProps) {
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghjkmnpqrstuvwxyz';
    const numbers = '23456789';
    const special = '!@#$%&*+-=?';
    const allChars = uppercase + lowercase + numbers + special;
    
    let newPassword = '';
    newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
    newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
    newPassword += numbers[Math.floor(Math.random() * numbers.length)];
    newPassword += special[Math.floor(Math.random() * special.length)];
    
    for (let i = 4; i < 16; i++) {
      newPassword += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    const shuffled = newPassword.split('').sort(() => Math.random() - 0.5).join('');
    setPassword(shuffled);
    setGeneratedPassword(shuffled);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword || password);
      toast({
        title: 'Copied',
        description: 'Password copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the password manually',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!user || !password) {
      toast({
        title: 'Error',
        description: 'Please enter or generate a password',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          user_id: user.id,
          temporary_password: password,
        },
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedPassword(data.temporary_password);
        setSuccess(true);
        toast({
          title: 'Password reset successful',
          description: 'Temporary password has been set. Make sure to copy it before closing.',
        });
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setGeneratedPassword('');
    setSuccess(false);
    onClose();
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a temporary password for {user.full_name || user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!success ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter or generate password"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generatePassword}
                    title="Generate strong password"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This temporary password will expire in 48 hours. The user must change it on first login.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading || !password}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert className="border-primary bg-primary/10">
                <AlertDescription className="space-y-2">
                  <p className="font-semibold">Password reset successful!</p>
                  <p>Temporary password (expires in 48 hours):</p>
                  <div className="flex items-center gap-2 mt-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded font-mono text-sm">
                      {generatedPassword}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Make sure to copy this password before closing. It cannot be retrieved later.
                  </p>
                </AlertDescription>
              </Alert>

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
