import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublicAuthor } from '@/types/author';
import { Calendar, Users, Gift } from 'lucide-react';

interface AuthorGiveawaysProps {
  author: PublicAuthor;
}

export function AuthorGiveaways({ author }: AuthorGiveawaysProps) {
  // Mock data for now - in real implementation, this would come from the author's campaigns
  const mockGiveaways = [
    {
      id: '1',
      title: 'Book Launch Giveaway',
      description: 'Win a signed copy of my latest novel plus exclusive merchandise!',
      endDate: '2024-02-15',
      entries: 1247,
      prize: 'Signed Book + Merchandise',
      status: 'active' as const,
    },
    {
      id: '2', 
      title: 'Holiday Special',
      description: 'Enter to win a complete book series bundle for the holidays.',
      endDate: '2024-01-30',
      entries: 892,
      prize: 'Complete Book Series',
      status: 'ending_soon' as const,
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ending_soon':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'ended':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'ending_soon':
        return 'Ending Soon';
      case 'ended':
        return 'Ended';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilEnd = (dateString: string) => {
    const endDate = new Date(dateString);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Current Giveaways ({mockGiveaways.length})
      </h2>

      {mockGiveaways.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockGiveaways.map((giveaway) => {
            const daysLeft = getDaysUntilEnd(giveaway.endDate);
            return (
              <div 
                key={giveaway.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700"
              >
                <div className="mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {giveaway.title}
                  </h4>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {giveaway.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Ends {formatDate(giveaway.endDate)}</span>
                    {daysLeft > 0 && (
                      <span className="ml-2 font-medium">
                        ({daysLeft} day{daysLeft !== 1 ? 's' : ''} left)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{giveaway.entries.toLocaleString()} entries</span>
                  </div>
                </div>
                
                <div className="w-full">
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
                  >
                    Enter Giveaway
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Gift className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No active giveaways at the moment
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            Check back later for new opportunities!
          </p>
        </div>
      )}
    </div>
  );
}
