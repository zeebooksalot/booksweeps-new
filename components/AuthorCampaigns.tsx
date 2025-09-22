import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { PublicCampaign } from '@/types/author';

interface AuthorCampaignsProps {
  campaigns: PublicCampaign[];
}

export function AuthorCampaigns({ campaigns }: AuthorCampaignsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Active Campaigns ({campaigns.length})</h2>
      
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {campaign.title}
              </h3>
              <Badge variant="outline">
                {campaign.status}
              </Badge>
            </div>
            
            {campaign.description && (
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                {campaign.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>
                Ends {formatDistanceToNow(new Date(campaign.end_date), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
