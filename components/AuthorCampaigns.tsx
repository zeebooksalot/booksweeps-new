import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { PublicCampaign } from '@/types/author';

interface AuthorCampaignsProps {
  campaigns: PublicCampaign[];
}

export function AuthorCampaigns({ campaigns }: AuthorCampaignsProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Active Campaigns ({campaigns.length})</h2>
      
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">
                {campaign.title}
              </h3>
              <Badge variant="outline">
                {campaign.status}
              </Badge>
            </div>
            
            {campaign.description && (
              <p className="text-gray-600 mb-3">
                {campaign.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
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
