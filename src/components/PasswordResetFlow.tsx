import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';

interface PasswordResetFlowProps {
  userId: string;
  email: string;
  onComplete: (newPassword: string) => void;
  loading: boolean;
}

export function PasswordResetFlow({ userId, email, onComplete, loading }: PasswordResetFlowProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const requirements = [
    { text: 'At least 8 characters', met: newPassword.length >= 8 },
    { text: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { text: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { text: 'One number', met: /[0-9]/.test(newPassword) },
    { text: 'One special character', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) },
    { text: 'Passwords match', met: newPassword && newPassword === confirmPassword },
  ];

  const allRequirementsMet = requirements.every(req => req.met);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allRequirementsMet) {
      onComplete(newPassword);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            Your password has been reset by an administrator. Please set a new strong password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Alert>
              <AlertDescription>
                You are setting a new password for: <strong>{email}</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Password Requirements:</p>
              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {req.met ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!allRequirementsMet || loading}
            >
              {loading ? 'Setting Password...' : 'Set Password & Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
