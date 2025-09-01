import ScrollToTop from '@/components/ScrollToTop';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/LoginModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, Clock } from 'lucide-react';
import { useCohortMembership } from '@/hooks/useCohortMembership';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ImageVideoViewer } from '@/components/ImageVideoViewer';

export default function Cohorts() {
  const { user } = useAuth();
  const { userCohorts, loading, error, isInAnyCohort } = useCohortMembership();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleLoginClose = () => setIsLoginModalOpen(false);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
      draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onLoginClick={handleLoginClick} />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="text-center">
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please sign in to view your cohorts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={handleLoginClick}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
        <ScrollToTop />
        <LoginModal isOpen={isLoginModalOpen} onClose={handleLoginClose} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onLoginClick={handleLoginClick} />
      
      <main className="flex-1">
        <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                My Cohorts
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Collaborate and learn with your learning cohorts
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading your cohorts...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-16">
                <p className="text-destructive text-lg">{error}</p>
              </div>
            )}

            {!loading && !error && !isInAnyCohort && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-4">No Cohorts Yet</h2>
                  <p className="text-muted-foreground mb-6">
                    You are not currently part of any learning cohort. Please speak to your facilitator to join a learning cohort.
                  </p>
                  <Button variant="outline" asChild>
                    <Link to="/learning-hub">
                      Explore Learning Hub
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && isInAnyCohort && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCohorts.map((membership) => (
                  <Card key={membership.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      {(membership.cohort?.image_url || membership.cohort?.video_url) && (
                        <div className="w-full h-32 bg-muted rounded-lg overflow-hidden mb-4">
                          <ImageVideoViewer
                            image={membership.cohort.image_url}
                            video={membership.cohort.video_url}
                            alt={membership.cohort.name}
                            title={membership.cohort.name}
                            className="w-full h-full object-cover"
                            aspectRatio="auto"
                            showControls={true}
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(membership.cohort?.status || '')}>
                          {membership.cohort?.status || 'Unknown'}
                        </Badge>
                        <Badge variant="outline" className={membership.status === 'enrolled' ? 'text-green-600' : ''}>
                          {membership.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">
                        {membership.cohort?.name || 'Unnamed Cohort'}
                      </CardTitle>
                      <CardDescription>
                        {membership.cohort?.description || 'No description available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Starts: {membership.cohort?.start_date ? 
                              format(new Date(membership.cohort.start_date), 'MMM d, yyyy') : 
                              'TBD'}
                          </span>
                        </div>
                        {membership.cohort?.end_date && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              Ends: {format(new Date(membership.cohort.end_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            Enrolled: {format(new Date(membership.enrolled_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button asChild className="w-full">
                          <Link to={`/cohort/${membership.cohort_id}`}>
                            Enter Cohort
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
      <LoginModal isOpen={isLoginModalOpen} onClose={handleLoginClose} />
    </div>
  );
}